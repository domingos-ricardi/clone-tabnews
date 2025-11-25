import webserver from "infra/webserver";
import activation from "models/activation";
import user from "models/user.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
  let createUserResponseBody;
  let activationTokenObj
  test("Create user account", async () => {
    const createUserResponse = await fetch(process.env.BASE_API_V1 + "/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "RegistrationFlow",
        email: "registration.flow@curso.dev",
        password: "RegistrationFlowPassword",
      }),
    });

    expect(createUserResponse.status).toBe(201);

    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationFlow",
      email: "registration.flow@curso.dev",
      password: createUserResponseBody.password,
      features: ["read:activation_token"],
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@doma.dev.br>");
    expect(lastEmail.recipients[0]).toBe("<registration.flow@curso.dev>");
    expect(lastEmail.subject).toBe("Ative seu cadastro no DomaDEV");
    expect(lastEmail.text).toContain("RegistrationFlow");

    const activationUUID = orchestrator.extractUUID(lastEmail.text);
    expect(lastEmail.text).toContain(`${webserver.origin}/register/activate/${activationUUID}`);

    activationTokenObj = await activation.findOneByValidId(activationUUID);

    expect(activationTokenObj.user_id).toBe(createUserResponseBody.id);
    expect(activationTokenObj.used_at).toBeNull();
  });

  test("Activate account", async () => {
    const activateResponse = await fetch(process.env.BASE_API_V1 + `/activation/${activationTokenObj.id}`, {
      method: "PATCH",
    });
  
    expect(activateResponse.status).toBe(200);
    
    const activateResponseBody = await activateResponse.json();
    expect(Date.parse(activateResponseBody.used_at)).not.toBeNull();

    const activatedUser = await user.findOneValidById(createUserResponseBody.id);
    expect(activatedUser.features).toEqual(["create:session"]);
  });

  // test("Login", async () => {

  // });

  // test("Get user information", async () => {

  // });
});
