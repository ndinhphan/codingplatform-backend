const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_KEY;
const tokenLife = process.env.JWT_LIFE;
const generateToken = (user) => {
  const userData = {
    username: user.username,
    email: user.email,
    id: user.id,
  };
  const accessToken = jwt.sign({ data: userData }, secretKey, {
    algorithm: "HS256",
    expiresIn: tokenLife,
  });
  return accessToken;
};

module.exports = {
  generateToken,
};
