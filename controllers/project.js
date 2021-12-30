const projectRouter = require("express").Router();
const fs = require("fs");
const path = require("path");
const middleware = require("../utils/middleware");
const { getDb } = require("../config/database");
const { initializeProjectFromTemplate } = require("../utils/helper");
const { deleteFolder, readFile } = require("../utils/filesystem");
const { reactProjectTemplate } = require("../utils/constants");
const { publicProjectPath } = require("../utils/constants");

async function initializeProject(newProject) {
  const db = getDb();
  initializeProjectFromTemplate({
    projectRootPath: newProject.dataValues.rootpath,
    projectType: newProject.dataValues.type,
  });
  if (newProject.dataValues.type == "react") {
    // reactProjectTemplate.folders.map(async (folder) => {
    //   folder = folder.split("/").pop();
    //   const newFolder = await db.Folder.create({
    //     name: folder,
    //   });
    //   newFolder.setProject(newProject);
    //   newFolder.update({ path: `/<${newFolder.dataValues.id}>` });
    // });
    for (const [filePath, content] of Object.entries(
      reactProjectTemplate.files
    )) {
      const filename = filePath.split("/").pop();
      const foldername = filePath.split("/")[1];
      // console.log("foldername:", filePath.split("/"));
      const file = await db.File.create({
        name: filename,
      });
      await file.setProject(newProject);
      if (foldername.length > 0 && filePath.split("/").length > 2) {
        const newFolder = await db.Folder.create({
          name: foldername,
        });
        newFolder.setProject(newProject);
        newFolder.update({ path: `/<${newFolder.dataValues.id}>` });
        await file.setFolder(newFolder);
      }
    }
  }
}

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
    initializeProject(newProject);

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
      include: [
        { model: db.User, attributes: ["id", "username", "email"] },
        {
          model: db.Folder,
          as: "folders",
          attributes: ["id", "name", "path", "folderId"],
        },
        { model: db.File, as: "files", attributes: ["id", "name", "folderId"] },
      ],
    });

    if (!findProjectById) return res.status(203).json("Cannot find project!");
    if (
      findProjectById.dataValues.User.dataValues.id === req.user.dataValues.id
    ) {
      let projectfolders = findProjectById.dataValues.folders;
      const foldermapping = {};
      projectfolders.map((folder) => {
        foldermapping[`${folder.id}`] = folder.name;
      });
      const folderpathmapping = {};
      projectfolders = projectfolders.map((folder) => {
        let folderpath = folder.dataValues.path;
        // console.log(folder.dataValues.path);
        for (folderid in foldermapping) {
          let replace = new RegExp(`<${folderid}>`);
          folderpath = folderpath.replace(replace, foldermapping[folderid]);
        }
        folder.dataValues.path = folderpath;
        folderpathmapping[`${folder.id}`] = folderpath;
        return {
          ...folder,
        };
      });
      // console.log(folderpathmapping);
      let projectfiles = findProjectById.dataValues.files;
      projectfiles = projectfiles.map((file) => {
        let filepath = "";
        if (file.dataValues.folderId)
          filepath =
            folderpathmapping[file.dataValues.folderId] +
            "/" +
            file.dataValues.name;
        else filepath = "/" + file.dataValues.name;
        // console.log(filepath);
        // console.log(
        //   readFile({
        //     filePath: path.join(findProjectById.dataValues.rootpath, filepath),
        //   })
        // );
        file.dataValues.code = readFile({
          filePath: path.join(findProjectById.dataValues.rootpath, filepath),
        });
        file.dataValues.path = filepath;
        return {
          ...file,
        };
      });
      // console.log(projectfolders);
      res.status(200).json(findProjectById.dataValues);
    } else
      res.status(403).json({ message: "Cannot get unauthorized project!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Cannot get project at the moment" });
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
// deletes project rootpath and project database entry
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
