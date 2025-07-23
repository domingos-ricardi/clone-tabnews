import crypto from "node:crypto";
import database from "infra/database.js";

const EXPIRATION_IN_MILISECONDS = 1000 * 60 * 60 * 24 * 30; // 30 dias

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  console.log("Token:", token);
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);

  const newSession = await runInsertQuery(token, userId, expiresAt);
  return newSession;

  async function runInsertQuery(token, userId, expiresAt) {
    const query = `
      INSERT INTO 
        sessions (token, user_id, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [token, userId, expiresAt];

    const result = await database.query({ text: query, values: values });
    return result.rows[0];
  }
}

const session = {
  create,
  EXPIRATION_IN_MILISECONDS,
};

export default session;
