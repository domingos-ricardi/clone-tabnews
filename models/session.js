import crypto from "node:crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors/api-errors";

const EXPIRATION_IN_MILISECONDS = 1000 * 60 * 60 * 24 * 30; // 30 dias

async function findOneValidByToken(token) {
  const sessionFound = await runSelectQuery(token);  
  if (sessionFound == undefined) {
    throw new UnauthorizedError();
  }

  return sessionFound;

  async function runSelectQuery(token) {
    const query = `
      SELECT * FROM sessions 
      WHERE token = $1 
        AND expires_at > timezone('utc', now())
      LIMIT 1;
    `;
    const values = [token];

    const result = await database.query({ text: query, values: values });
    return result.rows[0];
  }
}

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
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

async function renew(id) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);
  const renewedSession = await runUpdateQuery(id, expiresAt);
  return renewedSession;

  async function runUpdateQuery(id, expiresAt) {
    const query = `
      UPDATE sessions 
      SET expires_at = $2, updated_at = timezone('utc', now())
      WHERE id = $1
      RETURNING *;
    `;
    const values = [id, expiresAt];

    const result = await database.query({ text: query, values: values });
    return result.rows[0];
  }
}

const session = {
  create,
  findOneValidByToken,
  renew,
  EXPIRATION_IN_MILISECONDS,
};

export default session;
