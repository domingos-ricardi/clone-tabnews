import database from "infra/database";
import criptography from "models/criptography.js";
import { ValidationError, NotFoundError } from "infra/errors/api-errors";

async function create(userInputValues) {
  await validationUser(userInputValues);
  await hashPasswordToInput(userInputValues);

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
  if (!input.email || !input.username)
    throw new ValidationError();

  const userbyEmail = await getUserByEmail(input.email);
  const userByUsername = await getUserByUsername(input.username);

  if(!(userbyEmail == undefined && userByUsername == undefined))
    throw new ValidationError();
}

async function hashPasswordToInput(input) {
  const hashPass = await criptography.hash(input.password);
  input.password = hashPass;
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
