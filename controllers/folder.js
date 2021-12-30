const folderRouter = require("express").Router();
const path = require("path");
const middleware = require("../utils/middleware");
const { getDb } = require("../config/database");

const {
  createFolder,
  renameFolder,
  deleteFolder,
} = require("../utils/filesystem");
//create folder
folderRouter.post("/:id/folder", middleware.userExtractor, async (req, res) => {
  const { name, parentId } = req.body;
  const db = getDb();

  //TODO: folder name validation
  if (name.length <= 3) {
    return res.status(400).json({
      message: "folder name must be longer than 3",
    });
  }

  try {
    const project = await db.Project.findOne({
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
    if (!project)
      return res.status(404).json({ message: "Project not found!" });
    if (project.dataValues.User.dataValues.id !== req.user.dataValues.id) {
      return res
        .status(403)
        .json({ message: "Cannot access unauthorized project!" });
    }
    const newFolder = await db.Folder.create({
      name,
    });
    let parentFolderPath = "";
    if (parentId) {
      const parentFolder = await db.Folder.findOne({
        where: { id: parentId },
      });
      await newFolder.setParentFolder(parentFolder);
      parentFolderPath = parentFolder.dataValues.path;
    }

    await newFolder.setProject(project);
    await newFolder.update({
      path: `${parentFolderPath}/<${newFolder.dataValues.id}>`,
    });
    let projectfolders = project.dataValues.folders;
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
    let parentFolderPathInFs = "";
    if (newFolder.dataValues.folderId)
      parentFolderPathInFs = folderpathmapping[newFolder.dataValues.folderId];

    const folderPathInFs = path.join(
      project.dataValues.rootpath,
      parentFolderPathInFs,
      newFolder.dataValues.name
    );
    console.log(folderPathInFs);
    try {
      await createFolder({
        folderPath: folderPathInFs,
      });
    } catch (error) {
      newFolder.destroy();
      // console.log(error);
      return res.status(409).json({ message: error.message }).end();
    }

    res.status(201).json({
      ...newFolder.dataValues,
      path: [parentFolderPathInFs, newFolder.dataValues.name].join("/"),
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Cannot create folder at the moment" });
  }
});

//delete folder

folderRouter.delete(
  "/:id/folder",
  middleware.userExtractor,
  async (req, res) => {
    const { folderId } = req.body;
    const db = getDb();

    try {
      const project = await db.Project.findOne({
        where: { id: req.params.id },
        include: [
          { model: db.User, attributes: ["id", "username", "email"] },
          {
            model: db.Folder,
            as: "folders",
            attributes: ["id", "name", "path", "folderId"],
          },
          {
            model: db.File,
            as: "files",
            attributes: ["id", "name", "folderId"],
          },
        ],
      });
      if (
        findProjectById.dataValues.User.dataValues.id !== req.user.dataValues.id
      ) {
        return res
          .status(403)
          .json({ message: "Cannot access unauthorized project!" });
      }
      const findFolderById = await db.Folder.findOne({
        where: { id: folderId },
      });
      if (!findFolderById) return res.status(204).end();

      let projectfolders = project.dataValues.folders;
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
      console.log(folderpathmapping);
      let parentFolderPathInFs = "";
      if (findFolderById.dataValues.folderId)
        parentFolderPathInFs =
          folderpathmapping[findFolderById.dataValues.folderId];

      const folderPathInFs = path.join(
        project.dataValues.rootpath,
        parentFolderPathInFs,
        findFolderById.dataValues.name
      );
      console.log(folderPathInFs);
      await deleteFolder({ folderPath: folderPathInFs });
      await findFolderById.destroy();
      res.status(204).end();
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Cannot delete folder at the moment" });
    }
  }
);

//test
//create folder structure of:
// source
// -folder1
//   --folder2
//   ---file1
//   ---file2
// -folder3
//   --folder4
//   ---folder5

folderRouter.get("/:id/folder/test", async (req, res) => {
  const db = getDb();
  try {
    const newProject = await db.Project.create({
      name: "testproject",
      description: "project",
      type: "react",
    });
    let project = newProject;
    const newFolder = await db.Folder.create({
      name: "source",
      path: "",
    });
    await newFolder.setProject(project);
    await newFolder.update({ path: `/<${newFolder.dataValues.id}>` });

    const newFolder1 = await db.Folder.create({
      name: "folder1",
      path: "",
    });
    await newFolder1.setProject(project);
    await newFolder1.setParentFolder(newFolder);
    await newFolder1.update({
      path: `${newFolder.dataValues.path}/<${newFolder1.dataValues.id}>`,
    });
    const newFolder2 = await db.Folder.create({
      name: "folder2",
    });
    await newFolder2.setProject(project);
    await newFolder2.setParentFolder(newFolder);
    await newFolder2.update({
      path: `${newFolder.dataValues.path}/<${newFolder2.dataValues.id}>`,
    });

    const file1 = await db.File.create({
      name: "file1",
    });
    await file1.setFolder(newFolder2);
    await file1.setProject(project);

    const file2 = await db.File.create({
      name: "file2",
    });
    await file2.setFolder(newFolder2);
    await file2.setProject(project);

    project = await db.Project.findOne({
      where: { id: newProject.dataValues.id },
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
    let projectfolders = project.dataValues.folders;
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
    console.log(folderpathmapping);
    const projectinDB = await db.Project.findOne({
      where: { id: newProject.dataValues.id },
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
    // console.log(project.dataValues);
    console.log(projectfolders);
    const returnproject = { ...project };
    console.log(returnproject);
    res.status(200).json({
      message: `this works, requesting folder for projectid: ${req.params.id}`,
      project: project,
      projectinDB,
    });
    await project.destroy();
    // await newFolder.destroy();
    return;
  } catch (error) {
    console.log(error);
  }
});

module.exports = folderRouter;
