import database from "infra/database.js";

async function status(request, reponse) {
  const result = await database.query("SELECT 1 + 1 AS SUM;");
  console.log(result.rows);

  reponse
    .status(200)
    .json({ status: 200, mensagem: "Aplicação rodando normalmente" });
}

export default status;
