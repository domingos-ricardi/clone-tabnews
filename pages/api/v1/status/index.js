function status(request, reponse) {
  reponse
    .status(200)
    .json({ status: 200, mensagem: "Aplicação rodando normalmente" });
}

export default status;
