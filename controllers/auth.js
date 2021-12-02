const authRouter = require("express").Router();
const { EMAIL_REGEX } = require("../utils/constants");
const bcrypt = require("bcryptjs");
const { getDb } = require("../config/database");
const { generateToken } = require("../config/jwt");

const middleware = require("../utils/middleware");
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

    return res.status(201).json({ message: "User created!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Cannot create user at the moment" });
  }
});

//login

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const db = getDb();
  try {
    const foundUserByUsername = await db.User.findOne({
      attributes: ["id", "password", "username", "email"],
      where: { username },
      // include: [{ model: db.Project, as: "projects" }],
    });
    if (foundUserByUsername) {
      if (
        bcrypt.compareSync(password, foundUserByUsername.dataValues.password)
      ) {
        const userData = {
          id: foundUserByUsername.dataValues.id,
          username: foundUserByUsername.dataValues.username,
          email: foundUserByUsername.dataValues.email,
        };
        // const userProjects = foundUserByUsername.dataValues.projects.map(
        //   (project) => project.dataValues
        // );
        // const token = await jwtToken.generateToken(userData);
        const accessToken = generateToken(userData);
        return res.status(200).json({
          message: "Login success!",
          ...userData,
          accessToken,
          // projects: userProjects,
        });
      } else {
        return res.status(401).json("Wrong Credentials!");
      }
    } else {
      return res.status(401).json("Wrong Credentials!");
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error, message: "Cannot log in at the moment" });
  }
});

//authorize test api

authRouter.post("/authorize", middleware.userExtractor, async (req, res) => {
  if (req.user) {
    res.status(200).json({ message: "authorized!", ...req.user });
  }
});
module.exports = authRouter;
