function sum(num1, num2) {
  if (typeof num1 !== "number") return "Erro";

  return num1 + num2;
}

function div(num1, num2) {
  if (typeof num1 !== "number" || num2 === 0) return "Erro";

  return num1 / num2;
}

exports.sum = sum; //ESModules
exports.div = div;
