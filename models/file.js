module.exports = (sequelize, DataTypes) => {
  const File = sequelize.define("File", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      notEmpty: true,
    },
  });
  File.associate = (models) => {
    File.belongsTo(models.Project, {
      foreignKey: { name: "projectId" },
      as: "project",
      onDelete: "CASCADE",
    });
    File.belongsTo(models.Folder, {
      foreignKey: { name: "folderId" },
      as: "folder",
      onDelete: "CASCADE",
    });
  };
  return File;
};
