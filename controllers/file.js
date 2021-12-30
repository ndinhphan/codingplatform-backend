const fileRouter = require("express").Router();
const path = require("path");
const middleware = require("../utils/middleware");
const { getDb } = require("../config/database");

const {
  createFile,
  renameFile,
  deleteFile,
  updateFile,
} = require("../utils/filesystem");
//create folder
fileRouter.post("/:id/file", middleware.userExtractor, async (req, res) => {
  const { name, folderId } = req.body;
  const db = getDb();

  //TODO: file name validation
  if (name.length <= 3) {
    return res.status(400).json({
      message: "file name must be longer than 3",
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
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.dataValues.User.dataValues.id !== req.user.dataValues.id) {
      return res
        .status(403)
        .json({ message: "Cannot access unauthorized project!" });
    }
    if (!project) return res.status(404).json({ message: "Project not found" });

    const newFile = await db.File.create({
      name,
    });
    await newFile.setProject(project);

    let parentFolderPath = "";
    if (folderId) {
      const parentFolder = await db.Folder.findOne({
        where: { id: folderId },
      });
      await newFile.setFolder(parentFolder);
      parentFolderPath = parentFolder.dataValues.path;
    }

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
    if (newFile.dataValues.folderId)
      parentFolderPathInFs = folderpathmapping[newFile.dataValues.folderId];

    const filePathInFs = path.join(
      project.dataValues.rootpath,
      parentFolderPathInFs,
      newFile.dataValues.name
    );
    console.log(filePathInFs);
    try {
      await createFile({
        filePath: filePathInFs,
      });
    } catch (error) {
      newFile.destroy();
      // console.log(error);
      return res.status(409).json({ message: error.message }).end();
    }

    res.status(201).json({
      ...newFile.dataValues,
      path: [parentFolderPathInFs, newFile.dataValues.name].join("/"),
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Cannot create file at the moment" });
  }
});

fileRouter.delete("/:id/file", middleware.userExtractor, async (req, res) => {
  const { fileId } = req.body;
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
        { model: db.File, as: "files", attributes: ["id", "name", "folderId"] },
      ],
    });
    if (project.dataValues.User.dataValues.id !== req.user.dataValues.id) {
      return res
        .status(403)
        .json({ message: "Cannot access unauthorized project!" });
    }
    if (!project) return res.status(404).json({ message: "Project not found" });

    const findFileById = await db.File.findOne({
      where: { id: fileId },
    });

    if (!findFileById) {
      return res.status(404).json({ message: "file not found" });
    }
    let parentFolderPath = "";
    if (findFileById.folderId) {
      const parentFolder = await db.Folder.findOne({
        where: { id: findFileById.folderId },
      });
      parentFolderPath = parentFolder.dataValues.path;
    }

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
    if (findFileById.dataValues.folderId)
      parentFolderPathInFs =
        folderpathmapping[findFileById.dataValues.folderId];

    const filePathInFs = path.join(
      project.dataValues.rootpath,
      parentFolderPathInFs,
      findFileById.dataValues.name
    );
    console.log(filePathInFs);
    try {
      await deleteFile({
        filePath: filePathInFs,
      });
    } catch (error) {
      return res.status(409).json({ message: error.message }).end();
    }

    return res.status(204).json().end();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Cannot create file at the moment" });
  }
});
//update file content
fileRouter.put("/:id/file", middleware.userExtractor, async (req, res) => {
  const { fileId, code } = req.body;
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
        { model: db.File, as: "files", attributes: ["id", "name", "folderId"] },
      ],
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.dataValues.User.dataValues.id !== req.user.dataValues.id) {
      return res
        .status(403)
        .json({ message: "Cannot access unauthorized project!" });
    }
    if (!project) return res.status(404).json({ message: "Project not found" });

    const findFileById = await db.File.findOne({
      where: { id: fileId },
    });

    if (!findFileById) {
      return res.status(404).json({ message: "file not found" });
    }
    let parentFolderPath = "";
    if (findFileById.folderId) {
      const parentFolder = await db.Folder.findOne({
        where: { id: findFileById.folderId },
      });
      parentFolderPath = parentFolder.dataValues.path;
    }

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
    if (findFileById.dataValues.folderId)
      parentFolderPathInFs =
        folderpathmapping[findFileById.dataValues.folderId];

    const filePathInFs = path.join(
      project.dataValues.rootpath,
      parentFolderPathInFs,
      findFileById.dataValues.name
    );
    console.log(filePathInFs);
    try {
      await updateFile({
        filePath: filePathInFs,
        content: code,
      });
    } catch (error) {
      return res.status(409).json({ message: error.message }).end();
    }

    return res.status(200).json({ findFileById }).end();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Cannot update file at the moment" });
  }
});

//update multiple files content
fileRouter.put("/:id/files", middleware.userExtractor, async (req, res) => {
  const { files } = req.body;
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
        { model: db.File, as: "files", attributes: ["id", "name", "folderId"] },
      ],
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.dataValues.User.dataValues.id !== req.user.dataValues.id) {
      return res
        .status(403)
        .json({ message: "Cannot access unauthorized project!" });
    }
    if (!project) return res.status(404).json({ message: "Project not found" });

    const updatedfiles = [];

    files.forEach(async (file) => {
      const { fileId, code } = file;
      const findFileById = await db.File.findOne({
        where: { id: fileId },
      });

      if (!findFileById) {
        return res.status(404).json({ message: "file not found" });
      }
      let parentFolderPath = "";
      if (findFileById.folderId) {
        const parentFolder = await db.Folder.findOne({
          where: { id: findFileById.folderId },
        });
        parentFolderPath = parentFolder.dataValues.path;
      }

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
      if (findFileById.dataValues.folderId)
        parentFolderPathInFs =
          folderpathmapping[findFileById.dataValues.folderId];

      const filePathInFs = path.join(
        project.dataValues.rootpath,
        parentFolderPathInFs,
        findFileById.dataValues.name
      );
      // console.log(filePathInFs);
      try {
        await updateFile({
          filePath: filePathInFs,
          content: code,
        });
      } catch (error) {
        return res.status(409).json({ message: error.message }).end();
      }
      updatedfiles.push(findFileById.dataValues);
    });

    // console.log(updatedfiles);
    return res.status(200).json({ files: "files are updated" }).end();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Cannot update file at the moment" });
  }
});

module.exports = fileRouter;
