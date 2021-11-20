module.exports = (sequelize, DataTypes) => {
  const Folder = sequelize.define("Folder", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    path: {
      type: DataTypes.STRING,
      notEmpty: true,
    },
  });
  Folder.associate = (models) => {
    Folder.belongsTo(models.Project, {
      foreignKey: { name: "projectId", allowNull: false },
      as: "project",
      onDelete: "CASCADE",
    });
    //does this work?
    Folder.belongsTo(models.Folder, {
      foreignKey: { name: "folderId", allowNull: false },
      as: "parentFolder",
      onDelete: "CASCADE",
    });
    Folder.hasMany(models.File, {
      foreignKey: { name: "folderId", allowNull: false },
      as: "files",
      onDelete: "CASCADE",
    });
  };
  return Folder;
};
