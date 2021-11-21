module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define("Setting", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    tempsetting: {
      type: DataTypes.STRING,
      notEmpty: true,
    },
  });
  Setting.associate = (models) => {
    Setting.belongsTo(models.Project, {
      // foreignKey: { name: "projectId", allowNull: false },
      as: "project",
      onDelete: "CASCADE",
    });
  };
  return Setting;
};
