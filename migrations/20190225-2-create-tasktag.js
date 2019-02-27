module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TaskTags', {
    TaskId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    TagId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  })
    .then(() => queryInterface.addConstraint('TaskTags', ['TaskId', 'TagId'], {
      type: 'unique',
    }))
    .then(() => queryInterface.addConstraint('TaskTags', ['TaskId'], {
      type: 'foreign key',
      references: { table: 'Tasks', field: 'id' },
    }))
    .then(() => queryInterface.addConstraint('TaskTags', ['TagId'], {
      type: 'foreign key',
      references: { table: 'Tags', field: 'id' },
    }))
    .then(() => queryInterface.addIndex('TaskTags', ['TaskId']))
    .then(() => queryInterface.addIndex('TaskTags', ['TagId'])),

  down: queryInterface => queryInterface.dropTable('TaskTags'),
};
