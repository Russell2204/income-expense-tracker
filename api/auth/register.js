import bcrypt from "bcryptjs";
import { db, readJson, send } from "../../lib/db.js";
import { cookieHeader, createToken } from "../../lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  const { name, email, password } = readJson(req);
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanName = String(name || "").trim();
  if (!cleanName || !cleanEmail.includes("@") || String(password || "").length < 8) {
    return send(res, 400, { error: "invalid" });
  }
  const sql = db();
  const existing = await sql`select id from users where lower(email) = ${cleanEmail} limit 1`;
  if (existing.length) return send(res, 409, { error: "exists" });
  const passwordHash = bcrypt.hashSync(String(password), 10);
  const rows = await sql`
    insert into users (email, password_hash, name)
    values (${cleanEmail}, ${passwordHash}, ${cleanName})
    returning id, email, name
  `;
  const user = rows[0];
  await sql`
    insert into user_settings (user_id) values (${user.id})
    on conflict (user_id) do nothing
  `;
  res.setHeader("Set-Cookie", cookieHeader(createToken(user.id)));
  return send(res, 201, { user: { id: user.id, email: user.email, name: user.name } });
}
