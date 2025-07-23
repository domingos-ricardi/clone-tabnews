import user from "models/user.js";
import criptography from "models/criptography.js";
import {
  UnauthorizedError,
  NotFoundError,
  NotMatchError,
} from "infra/errors/api-errors.js";

async function validateAndReturn(providedEmail, providedPassword) {
  try {
    const storedUser = await user.findOneByEmail(providedEmail);
    await validatePass(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof NotMatchError || error instanceof NotFoundError)
      throw new UnauthorizedError();
    else throw error;
  }
}

async function validatePass(password, storedHashpass) {
  const matchPass = await criptography.compare(password, storedHashpass);
  if (!matchPass) throw new NotMatchError();
}

const authentication = {
  validateAndReturn,
};

export default authentication;
