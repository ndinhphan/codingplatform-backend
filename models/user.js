module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    username: {
      type: DataTypes.STRING,
      notEmpty: true,
    },
    email: {
      type: DataTypes.STRING,
      is: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g,
      notEmpty: true,
    },
    password: {
      type: DataTypes.STRING,
      notEmpty: true,
    },
  });
  User.associate = (models) => {
    User.hasMany(models.Project, {
      // foreignKey: { name: "userId", allowNull: false },
      as: "projects",
      onDelete: "CASCADE",
    });
  };
  return User;
};
