module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Tags', {
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
  })
    .then(() => queryInterface.addIndex('Tags', ['id']))
    .then(() => queryInterface.addIndex('Tags', ['name'])),

  down: queryInterface => queryInterface.dropTable('Tags'),
};
