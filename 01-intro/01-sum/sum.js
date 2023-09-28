function sum(a, b) {
  function isAN(value) {
    return (value instanceof Number||typeof value === 'number') && !isNaN(value);
  }
  if(!isAN(a) || !isAN(b)) {
    throw new TypeError
  } else {
    return a + b;
  }
}

module.exports = sum;
