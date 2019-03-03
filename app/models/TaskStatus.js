export default (sequelize, DataTypes) => {
  const TaskStatus = sequelize.define('TaskStatus', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  // TaskStatus.associate = (models) => {
  // TaskStatus.hasMany(models.Task, { foreignKey: 'statusId', as: 'status' });
  // };
  return TaskStatus;
};
