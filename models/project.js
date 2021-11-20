module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define("Project", {
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
    rootpath: {
      type: DataTypes.STRING,
      notEmpty: true,
    },
  });
  Project.associate = (models) => {
    Project.belongsTo(models.User, {
      foreignKey: { name: "userId", allowNull: false },
      as: "author",
      onDelete: "CASCADE",
    });
    Project.hasMany(models.File, {
      foreignKey: { name: "projectId", allowNull: false },
      as: "files",
      onDelete: "CASCADE",
    });
    Project.hasMany(models.Folder, {
      foreignKey: { name: "projectId", allowNull: false },
      as: "folders",
      onDelete: "CASCADE",
    });
  };
  return Project;
};
