/* eslint-disable no-undef */

const express = require("express");
const app = express();
const cors = require("cors");
const { connectToDb, getDb } = require("./config/database.js");
const middleware = require("./utils/middleware");

const authRouter = require("./controllers/auth");

app.use(cors());
app.use(express.json());
app.use(express.static("build"));
app.use(middleware.requestLogger);

const PORT = process.env.PORT || 5000;

let connectedToDb = false;
(async function start() {
  try {
    if (!connectedToDb) connectedToDb = await connectToDb();
    app.listen(PORT, () => {
      console.log(`API Server started on port ${PORT}`);
    });
  } catch (err) {
    console.log("ERROR", err);
  }
})();

app.get("/", (req, res) => {
  res.send("Server is online.");
});

// app.use('/api/users',usersRouter);
// app.use('/api/blogs',blogsRouter);
// app.use('/api/login',loginRouter);

app.use("/api/", authRouter);

app.use(middleware.errorHandler);
app.use(middleware.unknownEndpoint);

module.exports = app;
