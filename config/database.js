const Sequelize = require("sequelize");
require("dotenv").config();

const db = {};

//import models here
const userModel = require("../models/user");
const projectModel = require("../models/project");
const folderModel = require("../models/folder");
const fileModel = require("../models/file");
const settingModel = require("../models/setting");

async function connectToDb() {
  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "mysql",
    }
  );
  await sequelize.authenticate();

  //sync models here

  db.User = await userModel(sequelize, Sequelize);
  db.Project = await projectModel(sequelize, Sequelize);
  db.Folder = await folderModel(sequelize, Sequelize);
  db.File = await fileModel(sequelize, Sequelize);
  db.Setting = await settingModel(sequelize, Sequelize);

  if (db.User.associate) {
    db.User.associate(db);
  }

  if (db.Project.associate) {
    db.Project.associate(db);
  }
  if (db.Folder.associate) {
    db.Folder.associate(db);
  }
  if (db.File.associate) {
    db.File.associate(db);
  }
  if (db.Setting.associate) {
    db.Setting.associate(db);
  }

  await sequelize.sync({ force: false });
  console.log(
    `Connected to Mysql Database ${process.env.DB_NAME} with username:${process.env.DB_USERNAME}`
  );
  return true;
}
function getDb() {
  return db;
}

module.exports = { getDb, connectToDb };
