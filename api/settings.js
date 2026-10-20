import { db, readJson, send } from "../lib/db.js";
import { userIdFromRequest } from "../lib/session.js";

const DEFAULTS = { currency: "сум", theme: "light", lang: "ru" };

export default async function handler(req, res) {
  const userId = userIdFromRequest(req);
  if (!userId) return send(res, 401, { error: "auth" });
  const sql = db();

  if (req.method === "GET") {
    const rows = await sql`select currency, theme, lang from user_settings where user_id = ${userId} limit 1`;
    return send(res, 200, { settings: rows[0] || DEFAULTS });
  }

  if (req.method === "PUT") {
    const body = readJson(req);
    const currency = String(body.currency || DEFAULTS.currency).trim() || DEFAULTS.currency;
    const theme = body.theme === "dark" ? "dark" : "light";
    const lang = body.lang === "uz" ? "uz" : "ru";
    const rows = await sql`
      insert into user_settings (user_id, currency, theme, lang)
      values (${userId}, ${currency}, ${theme}, ${lang})
      on conflict (user_id) do update
      set currency = excluded.currency, theme = excluded.theme, lang = excluded.lang
      returning currency, theme, lang
    `;
    return send(res, 200, { settings: rows[0] });
  }

  return send(res, 405, { error: "method" });
}
