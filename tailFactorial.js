module.exports = tailCallFactorial = (n, memo = 1) =>
  n <= 0 ? memo : tailCallFactorial(n - 1, n * memo);
