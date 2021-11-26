const path = require("path");
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

const projectRootPath = "/project1";
const files = {
  "file1.js": "HELLO FILE1",
  "file2.js": "HELLO FILE2",
  "file3.js": "HELLO FILE3",
  "file4.js": "HELLO FILE4",
};
deleteFolder({ folderPath: projectRootPath });
createFolder({ folderPath: projectRootPath });
for (const [filePath, content] of Object.entries(files)) {
  console.log(filePath);
  createFile({ filePath: path.join(projectRootPath, filePath) });
  updateFile({ filePath: path.join(projectRootPath, filePath), content });
}
// deleteFolder({ folderPath: projectRootPath });
