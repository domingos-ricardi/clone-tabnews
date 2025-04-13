import database from "infra/database";
import { ValidationError, NotFoundError } from "infra/errors/api-errors";

async function create(userInputValues) {
  const validateUser = await validationUser(userInputValues);
  if (!validateUser) throw new ValidationError();

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const result = await database.query({
      text: `INSERT INTO 
              users (username, email, password) 
              VALUES ($1, $2, $3) RETURNING *;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return result.rows[0];
  }
}

async function getByUsername(username) {
  const user = await getUserByUsername(username);
  if (user == undefined) throw new NotFoundError();
  return user;
}

async function validationUser(input) {
  if (!input.email || !input.username) return false;

  const userbyEmail = await getUserByEmail(input.email);
  const userByUsername = await getUserByUsername(input.username);

  return userbyEmail == undefined && userByUsername == undefined;
}

async function getUserByEmail(email) {
  const result = await database.query({
    text: `SELECT * 
           FROM users 
           WHERE LOWER(email) = LOWER($1) LIMIT 1;`,
    values: [email],
  });

  return result.rows[0];
}

async function getUserByUsername(username) {
  const result = await database.query({
    text: `SELECT * 
           FROM users 
           WHERE LOWER(username) = LOWER($1) LIMIT 1;`,
    values: [username],
  });

  return result.rows[0];
}

const user = {
  create,
  getByUsername,
};

export default user;
