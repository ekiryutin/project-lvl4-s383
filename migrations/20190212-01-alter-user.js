module.exports = {
  up: queryInterface => queryInterface.addIndex('Users', ['id']),
  down: queryInterface => queryInterface.removeIndex('Users', ['id']),
};
