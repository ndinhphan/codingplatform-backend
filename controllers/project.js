const projectRouter = require("express").Router();
const fs = require("fs");
const path = require("path");
const middleware = require("../utils/middleware");
const { getDb } = require("../config/database");
projectRouter.post("/", middleware.userExtractor, async (req, res) => {
  const { name, description, type } = req.body;
  const db = getDb();

  if (name.length <= 3) {
    return res.status(400).json({
      message: "Project name must be longer than 3",
    });
  }
  if (!type) {
    return res.status(400).json({
      message: "Project type must be react or vue",
    });
  }

  try {
    const newProject = await db.Project.create({
      name,
      description,
      type,
      userId: req.user.id,
    });

    res.status(201).json(newProject.dataValues);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Cannot create project at the moment");
  }
});
module.exports = projectRouter;
