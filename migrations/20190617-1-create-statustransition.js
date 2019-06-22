module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('StatusTransitions', {
    fromId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'TaskStatuses', key: 'id' },
    },
    toId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'TaskStatuses', key: 'id' },
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    /* action: {
      type: Sequelize.STRING,
      allowNull: false,
    }, */
    access: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    priority: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })

    .then(() => queryInterface.addConstraint('StatusTransitions', ['fromId', 'toId'], {
      type: 'unique',
    }))
  /* // здесь почему-то вылезала ошибка при создании FK
    .then(() => queryInterface.addConstraint('StatusTransitions', ['fromId'], {
      type: 'foreign key',
      references: { table: 'TaskStatuses', field: 'id' },
    }))
    .then(() => queryInterface.addConstraint('StatusTransitions', ['toId'], {
      type: 'foreign key',
      references: { table: 'TaskStatuses', field: 'id' },
    })) */
  // .then(() => queryInterface.addIndex('StatusTransitions', ['FromId']))
  // .then(() => queryInterface.addIndex('StatusTransitions', ['ToId'])),

    .then(() => queryInterface.bulkInsert('StatusTransitions', [
      {
        fromId: 1, toId: 2, name: 'Начать', access: 'executor', priority: '1',
      },
      {
        fromId: 2, toId: 3, name: 'Готово', access: 'executor', priority: '1',
      },
      {
        fromId: 3, toId: 5, name: 'Принять', access: 'author', priority: '1',
      },
      {
        fromId: 3, toId: 4, name: 'Отклонить', access: 'author', priority: '2',
      },
      {
        fromId: 4, toId: 2, name: 'Начать', access: 'executor', priority: '1',
      },
    ], {})),

  down: queryInterface => queryInterface.dropTable('StatusTransitions'),
};
