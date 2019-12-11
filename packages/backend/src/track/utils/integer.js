const number = require("./number");

module.exports = (min, max) => (path, valueNode) => {
  number(path, valueNode);
  if (valueNode !== parseInt(valueNode, 10)) {
    throw new Error(
      `Property at ${path} must be integer value, received ${valueNode}`
    );
  }
  if (valueNode < min || valueNode > max) {
    throw new Error(
      `Property at ${path} must be in range ${min}-${max}, received ${valueNode}`
    );
  }
};
