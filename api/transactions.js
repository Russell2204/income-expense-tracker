import { db, readJson, send } from "../lib/db.js";
import { userIdFromRequest } from "../lib/session.js";

function requireUser(req, res) {
  const userId = userIdFromRequest(req);
  if (!userId) {
    send(res, 401, { error: "auth" });
    return null;
  }
  return userId;
}

export default async function handler(req, res) {
  const userId = requireUser(req, res);
  if (!userId) return;
  const sql = db();

  if (req.method === "GET") {
    const rows = await sql`
      select id, type, title, amount, to_char(date, 'YYYY-MM-DD') as date
      from transactions
      where user_id = ${userId}
      order by date desc, created_at desc
    `;
    return send(res, 200, {
      transactions: rows.map((row) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        amount: Number(row.amount),
        date: String(row.date).slice(0, 10)
      }))
    });
  }

  if (req.method === "POST") {
    const body = readJson(req);
    const title = String(body.title || "").trim();
    const amount = Number(body.amount);
    const date = String(body.date || "");
    const type = body.type === "expense" ? "expense" : "income";
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(amount) || amount <= 0) {
      return send(res, 400, { error: "invalid" });
    }
    const rows = await sql`
      insert into transactions (user_id, type, title, description, amount, date)
      values (${userId}, ${type}, ${title}, ${title}, ${amount}, ${date})
      returning id, type, title, amount, to_char(date, 'YYYY-MM-DD') as date
    `;
    const row = rows[0];
    return send(res, 201, {
      transaction: { ...row, amount: Number(row.amount), date: String(row.date).slice(0, 10) }
    });
  }

  if (req.method === "PUT") {
    const body = readJson(req);
    const title = String(body.title || "").trim();
    const amount = Number(body.amount);
    const date = String(body.date || "");
    const type = body.type === "expense" ? "expense" : "income";
    if (!body.id || !title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(amount) || amount <= 0) {
      return send(res, 400, { error: "invalid" });
    }
    const rows = await sql`
      update transactions
      set type = ${type}, title = ${title}, description = ${title}, amount = ${amount}, date = ${date}
      where id = ${body.id} and user_id = ${userId}
      returning id, type, title, amount, to_char(date, 'YYYY-MM-DD') as date
    `;
    if (!rows.length) return send(res, 404, { error: "missing" });
    const row = rows[0];
    return send(res, 200, {
      transaction: { ...row, amount: Number(row.amount), date: String(row.date).slice(0, 10) }
    });
  }

  if (req.method === "DELETE") {
    const id = String(req.query.id || "");
    if (!id) return send(res, 400, { error: "invalid" });
    const rows = await sql`delete from transactions where id = ${id} and user_id = ${userId} returning id`;
    if (!rows.length) return send(res, 404, { error: "missing" });
    return send(res, 200, { ok: true });
  }

  return send(res, 405, { error: "method" });
}
