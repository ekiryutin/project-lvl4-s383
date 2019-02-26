module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TaskTags', {
    /* id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    }, */
    taskId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    tagId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  })
    .then(() => queryInterface.addConstraint('TaskTags', ['taskId', 'tagId'], {
      type: 'unique',
    }))
    .then(() => queryInterface.addConstraint('TaskTags', ['taskId'], {
      type: 'foreign key',
      references: { table: 'Tasks', field: 'id' },
    }))
    .then(() => queryInterface.addConstraint('TaskTags', ['tagId'], {
      type: 'foreign key',
      references: { table: 'Tags', field: 'id' },
    }))
    // .then(() => queryInterface.addIndex('TaskTags', ['id']))
    .then(() => queryInterface.addIndex('TaskTags', ['taskId']))
    .then(() => queryInterface.addIndex('TaskTags', ['tagId'])),

  down: queryInterface => queryInterface.dropTable('TaskTags'),
};
