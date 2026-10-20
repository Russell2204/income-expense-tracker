import bcrypt from "bcryptjs";
import { db, readJson, send } from "../../lib/db.js";
import { cookieHeader, createToken } from "../../lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  const { email, password } = readJson(req);
  const cleanEmail = String(email || "").trim().toLowerCase();
  const sql = db();
  const rows = await sql`select id, email, name, password_hash from users where lower(email) = ${cleanEmail} limit 1`;
  const user = rows[0];
  if (!user || !bcrypt.compareSync(String(password || ""), user.password_hash)) {
    return send(res, 401, { error: "invalid" });
  }
  res.setHeader("Set-Cookie", cookieHeader(createToken(user.id)));
  return send(res, 200, { user: { id: user.id, email: user.email, name: user.name } });
}
