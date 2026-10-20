import { send } from "../../lib/db.js";
import { clearCookie } from "../../lib/session.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "method" });
  res.setHeader("Set-Cookie", clearCookie());
  return send(res, 200, { ok: true });
}
