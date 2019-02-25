module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Tasks', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
    },
    statusId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    dateTo: {
      type: Sequelize.DATEONLY,
    },
    authorId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    executorId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: Sequelize.DATE,
    },
  })
    .then(() => queryInterface.addConstraint('Tasks', ['statusId'], {
      type: 'foreign key',
      references: { table: 'TaskStatuses', field: 'id' },
    }))
    .then(() => queryInterface.addConstraint('Tasks', ['authorId'], {
      type: 'foreign key',
      references: { table: 'Users', field: 'id' },
    }))
    .then(() => queryInterface.addConstraint('Tasks', ['executorId'], {
      type: 'foreign key',
      references: { table: 'Users', field: 'id' },
    }))
    .then(() => queryInterface.addIndex('Tasks', ['id']))
    .then(() => queryInterface.addIndex('Tasks', ['statusId']))
    .then(() => queryInterface.addIndex('Tasks', ['authorId']))
    .then(() => queryInterface.addIndex('Tasks', ['executorId']))
    .then(() => queryInterface.addIndex('Tasks', ['dateTo']))
    .then(() => queryInterface.addIndex('Tasks', ['deletedAt'])),

  down: queryInterface => queryInterface.dropTable('Tasks'),
};
