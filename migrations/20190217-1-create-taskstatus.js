module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TaskStatuses', {
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
    color: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  })
    .then(() => queryInterface.bulkInsert('TaskStatuses', [
      {
        name: 'Новое', color: 'warning', createdAt: new Date(), updatedAt: new Date(),
      },
      {
        name: 'В работе', color: 'info', createdAt: new Date(), updatedAt: new Date(),
      },
      {
        name: 'Завершено', color: 'success', createdAt: new Date(), updatedAt: new Date(),
      },
    ], {})),

  down: queryInterface => queryInterface.dropTable('TaskStatuses'),
};
