import { db, send } from "../../lib/db.js";
import { userIdFromRequest } from "../../lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "method" });
  const userId = userIdFromRequest(req);
  if (!userId) return send(res, 401, { user: null });
  const sql = db();
  const users = await sql`select id, email, name from users where id = ${userId} limit 1`;
  if (!users.length) return send(res, 401, { user: null });
  return send(res, 200, { user: users[0] });
}
