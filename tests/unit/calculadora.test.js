const calculator = require("../../models/calculadora.js");

test("Sum 2,2 return 4", () => {
  const result = calculator.sum(2, 2);
  expect(result).toBe(4);
});

test("Sum 5,100 return 105", () => {
  const result = calculator.sum(5, 100);
  expect(result).toBe(105);
});

test("Sum 'text',100 return 'Erro'", () => {
  const result = calculator.sum("text", 100);
  expect(result).toBe("Erro");
});

test("Div 5,0 return 'Erro'", () => {
  const result = calculator.div(5, 0);
  expect(result).toBe("Erro");
});
