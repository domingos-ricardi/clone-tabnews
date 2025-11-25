import database from "infra/database";
import criptography from "models/criptography.js";
import { ValidationError, NotFoundError } from "infra/errors/api-errors";

async function create(userInputValues) {
  await validationUserMail(userInputValues);
  await validationUserName(userInputValues);
  await hashPasswordToInput(userInputValues);
  injectDefaultFeaturesInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const result = await database.query({
      text: `INSERT INTO 
              users (username, email, password, features) 
              VALUES ($1, $2, $3, $4) RETURNING *;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
        userInputValues.features,
      ],
    });
    return result.rows[0];
  }

  function injectDefaultFeaturesInObject(userInputValues) {
    userInputValues.features = ["read:activation_token"];
  }
}

async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);
  await validationUserMail(userInputValues);

  if (
    "username" in userInputValues &&
    username.toLowerCase() !== userInputValues.username.toLowerCase()
  )
    await validationUserName(userInputValues);

  if ("password" in userInputValues) await hashPasswordToInput(userInputValues);

  const userWithNewValues = { ...currentUser, ...userInputValues };
  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userInputValues) {
    const result = await database.query({
      text: `UPDATE users 
             SET 
              username = $2, 
              email = $3, 
              password = $4, 
              updated_at = timezone('utc', now()) 
             WHERE id = $1 
             RETURNING *;`,
      values: [
        userInputValues.id,
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return result.rows[0];
  }
}

async function findOneValidById(userId) {
  const user = await getUserById(userId);
  if (user == undefined) throw new NotFoundError();
  return user;
}

async function findOneByUsername(username) {
  const user = await getUserByUsername(username);
  if (user == undefined) throw new NotFoundError();
  return user;
}

async function findOneByEmail(email) {
  const user = await getUserByEmail(email);
  if (user == undefined) throw new NotFoundError();
  return user;
}

async function validationUserMail(input) {
  if ("email" in input) {
    if (!input.email) throw new ValidationError();
    else await validateUniqueUserMail(input.email);
  }
}

async function validationUserName(input) {
  if ("username" in input) {
    if (!input.username) throw new ValidationError();
    else {
      await validateUniqueUserName(input.username);
    }
  }
}

async function hashPasswordToInput(input) {
  const hashPass = await criptography.hash(input.password);
  input.password = hashPass;
}

async function getUserById(id) {
  const result = await database.query({
    text: `SELECT *
           FROM users
           WHERE id = $1
           LIMIT 1;`,
    values: [id],
  });

  return result.rows[0];
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

async function validateUniqueUserName(username) {
  const result = await database.query({
    text: `SELECT username 
           FROM users 
           WHERE LOWER(username) = LOWER($1);`,
    values: [username],
  });

  if (result.rowCount > 0) throw new ValidationError();
}

async function validateUniqueUserMail(email) {
  const result = await database.query({
    text: `SELECT email 
           FROM users 
           WHERE LOWER(email) = LOWER($1);`,
    values: [email],
  });

  if (result.rowCount > 0) throw new ValidationError();
}

async function setFeatures(userId, features) {
  const userWithNewFeatures = await runUpdateQuery(userId, features);
  return userWithNewFeatures;

  async function runUpdateQuery(userId, features) {
    const result = await database.query({
      text: `UPDATE 
              users 
             SET 
              features = $2,
              updated_at = timezone('utc', now()) 
             WHERE 
              id = $1 
             RETURNING 
              *
             ;`,
      values: [userId, features],
    });
    return result.rows[0];
  }
}

const user = {
  create,
  update,
  findOneByUsername,
  findOneByEmail,
  findOneValidById,
  setFeatures,
};

export default user;
