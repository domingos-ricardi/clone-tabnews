import bcryptjs from "bcryptjs";

const pepper = "42f1cb24-cfeb-4e67-81f6-66519056c829";

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

function setPepper(pass) {
  return process.env.NODE_ENV === "production"
    ? process.env.PEPPER_KEY + pass
    : pepper + pass;
}

async function hash(password) {
  const rounds = getNumberOfRounds();
  const peppered = setPepper(password);
  return bcryptjs.hash(peppered, rounds);
}

async function compare(providerPassword, storedHashpass) {
  const peppered = setPepper(providerPassword);
  return await bcryptjs.compare(peppered, storedHashpass);
}

const criptography = {
  hash,
  compare,
};

export default criptography;
