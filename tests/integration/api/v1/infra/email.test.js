import email from 'infra/email.js';

describe("infra/email.js", () => {
    test("send()", async () => {
        await email.send({
            from: "Doma <doma@test.com>",
            to: "user@mail.com",
            subject: "Test send Mail",
            text: "Text from mail server."
        });
    })
})