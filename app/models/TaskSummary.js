export default (sequelize, DataTypes) => {
  const TaskSummary = sequelize.define('TaskSummary', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    freezeTableName: true,
    timestamps: false,
  });
  return TaskSummary;
};
