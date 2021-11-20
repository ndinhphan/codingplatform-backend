const authRouter = require("express").Router();
const { EMAIL_REGEX } = require("../utils/constants");
const bcrypt = require("bcryptjs");
const { getDb } = require("../config/database");
// register
authRouter.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  const db = getDb();
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      message: "Invalid Email Address",
    });
  }

  if (password.length <= 3) {
    return res.status(400).json({
      message: "Password length must be larger than 3",
    });
  }

  const foundUserByUsername = await db.User.findOne({
    attributes: ["id"],
    where: { username },
  });

  const foundUserByEmail = await db.User.findOne({
    attributes: ["id"],
    where: { email },
  });

  if (foundUserByUsername || foundUserByEmail)
    return res.json({ message: "Username or Email Already in use!" });

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await db.User.create({
      username,
      email,
      password: passwordHash,
    });
    // const savedUser = await db.User.findOne({
    //   attributes: ["id", "username", "email"],
    //   where: { email },
    // });
    return res.status(201).json({ message: "User created!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Cannot create user at the moment" });
  }
});

//login

module.exports = authRouter;
