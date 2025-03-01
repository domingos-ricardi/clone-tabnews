import database from "infra/database";

async function create(userInputValues) {
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

const user = {
  create,
};

export default user;
