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
    description: {
      type: DataTypes.STRING,
    },
    rootpath: {
      type: DataTypes.STRING,
      notEmpty: true,
    },
    type: {
      type: DataTypes.STRING,
      notEmpty: true,
    },
  });
  Project.associate = (models) => {
    Project.belongsTo(models.User, {
      foreignKey: { name: "userId" },
      onDelete: "CASCADE",
    });
    Project.hasMany(models.File, {
      foreignKey: { name: "projectId" },
      as: "files",
      onDelete: "CASCADE",
    });
    Project.hasMany(models.Folder, {
      foreignKey: { name: "projectId" },
      as: "folders",
      onDelete: "CASCADE",
    });
  };
  return Project;
};
