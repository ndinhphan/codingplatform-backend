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

const { initializeProjectFromTemplate } = require("./helper");
const projectRootPath = "/project1";

const files = {
  "file1.js": "HELLO FILE1",
  "file2.js": "HELLO FILE2",
  "file3.js": "HELLO FILE3",
  "file4.js": "HELLO FILE4",
};
// deleteFolder({ folderPath: projectRootPath });
// createFolder({ folderPath: projectRootPath });
// //create files
// for (const [filePath, content] of Object.entries(files)) {
//   createFile({ filePath: path.join(projectRootPath, filePath) });
//   updateFile({ filePath: path.join(projectRootPath, filePath), content });
//   // renameFile({
//   //   filePath: path.join(projectRootPath, filePath),
//   //   newFilePath: path.join(projectRootPath, filePath + "NEW"),
//   // });
// }
// //read all files
// for (let filePath of Object.keys(files)) {
//   console.log(readFile({ filePath: path.join(projectRootPath, filePath) }));
// }

initializeProjectFromTemplate({
  projectRootPath: "/testproject1234",
  projectType: "react",
});

// deleteFolder({ folderPath: projectRootPath });
