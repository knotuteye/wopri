const tailCallFactorial = require("../tailFactorial");

test("Returns correct factorial for n=12", () => {
  expect(tailCallFactorial(12)).toBe(479001600);
});
