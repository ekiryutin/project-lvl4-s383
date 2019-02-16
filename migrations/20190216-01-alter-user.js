module.exports = {
  up: queryInterface => queryInterface.addIndex('Users', ['lastName'])
    .then(() => queryInterface.addIndex('Users', ['firstName'])),
  down: queryInterface => queryInterface.removeIndex('Users', ['lastName'])
    .then(() => queryInterface.removeIndex('Users', ['firstName'])),
};
