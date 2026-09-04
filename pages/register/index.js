import { useState } from "react";
import { Button } from "@primer/react";
import DefaultLayout from "interface/DefaultLayout";

function RegisterPage() {
  console.log("RegisterPage");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const requestBody = {username, email, password};

    const response = await fetch("/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 201){
      location.href = "/register/confirm"
    }

    console.log("Status: ", response.status);
    console.log(await response.json());
  }

  return (
    <DefaultLayout metadata={{
      title: "Cadastro",
      description: "Crie sua conta de forma gratuita."
    }}>
      <h1>Cadastro</h1>

      <form onSubmit={handleSubmit}>
        <div>
          Nome de usuário:<br/>
          <input 
            type="text" 
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}/>
        </div>

        <div>
          Email:<br/>
          <input 
            type="email" 
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}/>
        </div>

        <div>
          Senha:<br/>
          <input 
            type="password" 
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}/>
        </div>
        <br />
        <Button type="submit">Criar Cadastro</Button>
      </form>
    </DefaultLayout>
  );
}

export default RegisterPage