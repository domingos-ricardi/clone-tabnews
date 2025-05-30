import bcryptjs from 'bcryptjs';

function getNumberOfRounds() {
  return process.env.NODE_ENV === 'production' ? 14 : 1;
}

async function hash(password) {
  const rounds = getNumberOfRounds();
  return bcryptjs.hash(password, rounds)  ;
}

async function compare(providerPassword, storedHashpass) {
  return await bcryptjs.compare(providerPassword, storedHashpass);
}

const criptography = {
  hash,
  compare
};

export default criptography;