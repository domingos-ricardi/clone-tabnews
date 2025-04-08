import database from "infra/database";
import { ValidationError } from "infra/errors/api-errors";

async function create(userInputValues) {
  const user = getUserByEmail(userInputValues.email);
  if (user != undefined)
    throw new ValidationError({
      message: "Não foi possível cadastrar novo usuário.",
      action: "Verifique os dados informados e tente novamente.",
    });

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

async function getUserByEmail(email) {
  const result = await database.query({
    text: `SELECT * 
           FROM users 
           WHERE LOWER(email) = LOWER($1);`,
    values: [email],
  });
  return result.rows[0];
}

const user = {
  create,
};

export default user;
