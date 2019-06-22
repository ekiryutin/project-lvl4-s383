export default (sequelize, DataTypes) => {
  const StatusTransition = sequelize.define('StatusTransition', {
    fromId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    toId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    access: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    timestamps: false,
  });
  return StatusTransition;
};
