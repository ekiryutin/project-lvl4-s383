export default (sequelize) => {
  const TaskAttachment = sequelize.define('TaskAttachment', {
  }, {
    timestamps: false,
  });
  return TaskAttachment;
};
