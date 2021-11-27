const projectRouter = require("express").Router();
const fs = require("fs");
const path = require("path");
const middleware = require("../utils/middleware");
const { getDb } = require("../config/database");
const { initializeProjectFromTemplate } = require("../utils/helper");
const { deleteFolder } = require("../utils/filesystem");
//create project
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
    });
    await newProject.setUser(req.user);
    //update rootpath = projectid
    await newProject.update({ rootpath: `/${newProject.dataValues.id}` });

    //TODO: initialize project also adds files and folders in database
    initializeProjectFromTemplate({
      projectRootPath: newProject.dataValues.rootpath,
      projectType: newProject.dataValues.type,
    });
    res.status(201).json(newProject.dataValues);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Cannot create project at the moment");
  }
});

//get all project from userid
projectRouter.get("/", middleware.userExtractor, async (req, res) => {
  const db = getDb();
  try {
    const findAllProjectsByUserId = await db.Project.findAll({
      where: { userId: req.user.dataValues.id },
    });
    if (findAllProjectsByUserId) res.status(200).json(findAllProjectsByUserId);
    else return res.status(203).end();
  } catch (error) {
    console.log(error);
    return res.status(500).json("Cannot get projects at the moment");
  }
});

//get project from projectid
projectRouter.get("/:id", middleware.userExtractor, async (req, res) => {
  const db = getDb();
  try {
    const findProjectById = await db.Project.findOne({
      where: { id: req.params.id },
      include: [{ model: db.User, attributes: ["id", "username", "email"] }],
    });
    if (!findProjectById) return res.status(203).json("Cannot find project!");
    if (
      findProjectById.dataValues.User.dataValues.id === req.user.dataValues.id
    ) {
      res.status(200).json(findProjectById.dataValues);
    } else res.status(403).json("Cannot get unauthorized project!");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Cannot get project at the moment");
  }
});

//update project from projectid
projectRouter.put("/:id", middleware.userExtractor, async (req, res) => {
  const db = getDb();
  const { name, description } = req.body;
  try {
    const findProjectById = await db.Project.findOne({
      where: { id: req.params.id },
      include: [{ model: db.User, attributes: ["id", "username", "email"] }],
    });
    if (
      findProjectById.dataValues.User.dataValues.id === req.user.dataValues.id
    ) {
      //do something here
      if (name && description) {
        await findProjectById.update({ name, description });
        res.status(201).json(findProjectById.dataValues);
      } else res.status(400).json("Project name or description is invalid!");
    } else res.status(403).json("Cannot update unauthorized project!");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Cannot get project at the moment");
  }
});

// delete project from projectid
projectRouter.delete("/:id", middleware.userExtractor, async (req, res) => {
  const db = getDb();
  try {
    const findProjectById = await db.Project.findOne({
      where: { id: req.params.id },
      include: [{ model: db.User, attributes: ["id", "username", "email"] }],
    });
    if (!findProjectById) return res.status(204).end();
    if (
      findProjectById.dataValues.User.dataValues.id === req.user.dataValues.id
    ) {
      //do something here
      deleteFolder({ folderPath: findProjectById.dataValues.rootpath });
      await findProjectById.destroy();
      return res.status(204).end();
    } else res.status(403).json("Cannot delete unauthorized project!");
  } catch (error) {
    console.log(error);
    return res.status(500).json("Cannot delete project at the moment");
  }
});

module.exports = projectRouter;
