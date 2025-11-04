import email from 'infra/email.js'
import database from 'infra/database.js'
import webserver from 'infra/webserver.js'

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

async function findOneByUserId(userId) {
  const results = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          user_id = $1
        LIMIT
          1
        ;`,
        values: [userId]
    });

    return results.rows[0];
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

const activation = {
  create,
  findOneByUserId,
  sendEmailToUser
}

export default activation;