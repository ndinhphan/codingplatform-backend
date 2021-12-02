const folderRouter = require("express").Router();
const path = require("path");

const {
  createFolder,
  renameFolder,
  deleteFolder,
} = require("../utils/filesystem");

folderRouter.post("/:id/folder", middleware.userExtractor, async (req, res) => {
  const { name, folderpath, parentId, projectId } = req.body;
  const db = getDb();

  //TODO: folder name validation
  if (name.length <= 3) {
    return res.status(400).json({
      message: "folder name must be longer than 3",
    });
  }

  try {
    const newFolder = await db.Folder.create({
      path: path.join(folderpath, name),
    });
    const project = await db.Project.findOne({
      where: { id: req.params.id },
    });
    await newFolder.setProject(project);
    //TODO: set parent folder
    res.status(201).json(newFolder);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Cannot create folder at the moment");
  }
});

module.exports = folderRouter;
