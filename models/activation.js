import email from 'infra/email.js'
import database from 'infra/database.js'
import webserver from 'infra/webserver.js'
import { NotFoundError, UnauthorizedError } from 'infra/errors/api-errors.js';
import user from 'models/user.js';

const EXPIRATION_IN_MILISECONDS = 60 * 15 * 1000 // 15 minutes

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);
  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
        ;`,
        values: [userId, expiresAt]
    });

    return results.rows[0];
  }
}

async function findOneByValidId(tokenId) {
  const activationTokenObj = await findByUUID(tokenId);
  return activationTokenObj;

  async function findByUUID(uuid) {
    const results = await database.query({
        text: `
          SELECT
            *
          FROM
            user_activation_tokens
          WHERE
            id = $1
            AND expires_at > NOW()  
            AND used_at IS NULL
          LIMIT
            1
          ;`,
          values: [uuid]
      });

      if (results.rowCount === 0) {
        throw new NotFoundError({
          message: "Token de ativação não encontrado ou expirado.",
          action: "Faça um novo cadastro.",
        });
      }

      return results.rows[0];
  }
}


async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "DomaDEV <contato@doma.dev.br>",
    to: user.email,
    subject: "Ative seu cadastro no DomaDEV",
    text: `Olá ${user.username}.

Clique no link abaixo para ativar seu cadastro no DomaDEV.

${webserver.origin}/register/activate/${activationToken.id}


Atenciosamente,
Equipe DomaDEV.`,
  })
}

async function markAsUsed(activationTokenId) {
  const usedToken = await runUpdateQuery(activationTokenId);
  return usedToken;

  async function runUpdateQuery(activationTokenId) {
    const results = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
        ;`,
        values: [activationTokenId]
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message: "Token de ativação não encontrado.",
        action: "Verifique o link ou faça um novo cadastro.",
      });
    }

    return results.rows[0];
  }
}

async function activateUser(userId) {
  const userToActivate = await user.findOneValidById(userId);
  if (userToActivate.features.includes("read:activation_token")) {
    const activatedUser = await user.setFeatures(userId, ["create:session"]);
    return activatedUser; 
  } else {
    throw new UnauthorizedError({
      message: "Usuário sem permissão para ativação.",
      action: "Verifique os dados ou entre em contato com o suporte.",
    });
  }
}

const activation = {
  create,
  findOneByValidId,
  sendEmailToUser,
  markAsUsed,
  activateUser,
}

export default activation;