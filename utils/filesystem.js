const fs = require("fs");
const path = require("path");
const { publicProjectPath } = require("../utils/constants");
const filename = "testname.txt";

const createFile = ({ filePath }) => {
  if (!filePath) throw new Error("filePath cannot be empty!");
  if (fs.existsSync(path.join(publicProjectPath, filePath)))
    throw new Error(`File${filePath} already exists!`);
  try {
    fs.writeFileSync(path.join(publicProjectPath, filePath), "");
  } catch (e) {
    console.log(e);
  } finally {
  }
};

const readFile = ({ filePath }) => {
  if (!filePath) throw new Error("filePath cannot be empty!");
  if (!fs.existsSync(path.join(publicProjectPath, filePath)))
    throw new Error(`File ${filePath} does not exist!`);
  try {
    let content = fs.readFileSync(
      path.join(publicProjectPath, filePath),
      "utf-8"
    );
    return content;
  } catch (error) {
    console.log(error);
  } finally {
  }
};

const updateFile = ({ filePath, content }) => {
  if (!filePath) throw new Error("filePath cannot be empty!");
  if (!content) throw new Error("file content cannot be empty!");
  if (!fs.existsSync(path.join(publicProjectPath, filePath)))
    throw new Error(`File ${filePath} does not exist!`);
  try {
    fs.writeFileSync(path.join(publicProjectPath, filePath), content);
  } catch (e) {
    console.log(e);
  }
};

const renameFile = ({ filePath, newFilePath }) => {
  if (filePath == newFilePath) return;
  if (!filePath) throw new Error("filePath cannot be empty!");
  if (!fs.existsSync(path.join(publicProjectPath, filePath)))
    throw new Error(`File ${filePath} does not exist!`);
  if (fs.existsSync(path.join(publicProjectPath, newFilePath)))
    throw new Error(`File ${newFilePath} already exists!`);
  try {
    fs.renameSync(
      path.join(publicProjectPath, filePath),
      path.join(publicProjectPath, newFilePath)
    );
  } catch (e) {
    console.log(e);
  }
};

const deleteFile = ({ filePath }) => {
  if (!filePath) throw new Error("filePath cannot be empty!");

  try {
    if (fs.existsSync(path.join(publicProjectPath, filePath)))
      fs.unlinkSync(path.join(publicProjectPath, filePath));
  } catch (e) {
    console.log(e);
  } finally {
    // console.log("deleted file ", path.join(publicProjectPath, filePath));
  }
};

const createFolder = ({ folderPath }) => {
  if (!folderPath) throw new Error("folderPath cannot be empty!");
  if (fs.existsSync(path.join(publicProjectPath, folderPath)))
    throw new Error(`Folder ${folderPath} already exists!`);

  try {
    fs.mkdirSync(path.join(publicProjectPath, folderPath));
  } catch (e) {
    console.log(e);
  } finally {
  }
};

const deleteFolder = ({ folderPath }) => {
  if (!folderPath) throw new Error("folderPath cannot be empty!");

  try {
    if (fs.existsSync(path.join(publicProjectPath, folderPath)))
      fs.rmSync(path.join(publicProjectPath, folderPath), {
        recursive: true,
        force: true,
      });
  } catch (e) {
    console.log(e);
  } finally {
  }
};

const renameFolder = ({ folderPath, newFolderPath }) => {
  if (folderPath == newFolderPath) return;

  if (!folderPath) throw new Error("folderPath cannot be empty!");
  if (!fs.existsSync(path.join(publicProjectPath, folderPath)))
    throw new Error(`Folder ${folderPath} does not exist!`);
  if (fs.existsSync(path.join(publicProjectPath, newFolderPath)))
    throw new Error(`Folder ${newFolderPath} already exists!`);
  try {
    fs.renameSync(
      path.join(publicProjectPath, folderPath),
      path.join(publicProjectPath, newFolderPath)
    );
  } catch (e) {
    console.log(e);
  } finally {
  }
};

module.exports = {
  createFile,
  readFile,
  updateFile,
  deleteFile,
  renameFile,
  createFolder,
  deleteFolder,
  renameFolder,
};
