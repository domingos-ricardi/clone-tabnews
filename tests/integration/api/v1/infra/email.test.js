import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "Doma <doma@test.com>",
      to: "user@mail.com",
      subject: "Test send Mail",
      text: "Text from mail server.",
    });

    await email.send({
      from: "Doma Last <doma.last@test.com>",
      to: "last@mail.com",
      subject: "Test last email",
      text: "Text from mail server by last email.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<doma.last@test.com>");
    expect(lastEmail.recipients[0]).toBe("<last@mail.com>");
    expect(lastEmail.subject).toBe("Test last email");
    expect(lastEmail.text).toBe("Text from mail server by last email.\n");
  });
});
