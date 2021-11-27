const {
  createFile,
  readFile,
  updateFile,
  deleteFile,
  renameFile,
  createFolder,
  deleteFolder,
  renameFolder,
} = require("./filesystem");

const path = require("path");

const { reactProjectTemplate } = require("./constants");

const initializeProjectFromTemplate = ({ projectRootPath, projectType }) => {
  deleteFolder({ folderPath: projectRootPath });
  createFolder({ folderPath: projectRootPath });
  if (projectType === "react") {
    reactProjectTemplate.folders.map((folderPath) => {
      createFolder({ folderPath: path.join(projectRootPath, folderPath) });
    });
    for (const [filePath, content] of Object.entries(
      reactProjectTemplate.files
    )) {
      const fullFilePath = path.join(projectRootPath, filePath);
      // TODO:trim before updating
      createFile({ filePath: fullFilePath });
      updateFile({ filePath: fullFilePath, content: content.trim() });
    }
  }
};

module.exports = { initializeProjectFromTemplate };
