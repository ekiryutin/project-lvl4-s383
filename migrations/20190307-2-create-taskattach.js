module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TaskAttachments', {
    TaskId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    AttachmentId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  })
    .then(() => queryInterface.addConstraint('TaskAttachments', ['TaskId', 'AttachmentId'], {
      type: 'unique',
    }))
    .then(() => queryInterface.addConstraint('TaskAttachments', ['TaskId'], {
      type: 'foreign key',
      references: { table: 'Tasks', field: 'id' },
    }))
    .then(() => queryInterface.addConstraint('TaskAttachments', ['AttachmentId'], {
      type: 'foreign key',
      references: { table: 'Attachments', field: 'id' },
    }))
    .then(() => queryInterface.addIndex('TaskAttachments', ['TaskId']))
    .then(() => queryInterface.addIndex('TaskAttachments', ['AttachmentId'])),

  down: queryInterface => queryInterface.dropTable('TaskAttachments'),
};
