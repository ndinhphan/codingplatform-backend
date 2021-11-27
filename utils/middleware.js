const { getDb } = require("../config/database");
const logger = require("./logger");
const jwt = require("jsonwebtoken");

const requestLogger = (request, response, next) => {
  logger.info("Method: ", request.method);
  logger.info("Path:", request.path);
  logger.info("Body", request.body);
  next();
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }
  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

//extract token and put it into request when request gets passed through middlewares
const tokenExtractor = (request, response, next) => {
  logger.info("token extractor is working");
  const authorization = request.get("Authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer")) {
    logger.info("found token ", authorization.substring(7));
    request.token = authorization.substring(7);
  } else request.token = null;
  next();
};

//middleware that verifies extracted bearer token and finds the user in database if token is valid
const userExtractor = async (request, response, next) => {
  const db = getDb();
  logger.info("user extractor is working");

  if (request.token !== null) {
    try {
      const decodedToken = await jwt.verify(request.token, process.env.JWT_KEY);
      const user = await db.User.findOne({
        attributes: ["id", "username", "email"],
        where: { username: decodedToken.data.username },
      });
      if (user) {
        request.user = user;
        logger.info("Found user from token: ", request.user.dataValues);
      } else {
        request.user = null;
        logger.info("User does not exist in database");
        return response.status(401).json("Invalid Token!");
      }
    } catch (error) {
      logger.info("Invalid token!");
      return response.status(401).json("Invalid Token!");
    }
  } else {
    return response.status(401).json("Unauthorized!");
  }
  next();
};

module.exports = {
  errorHandler,
  unknownEndpoint,
  requestLogger,
  tokenExtractor,
  userExtractor,
};
