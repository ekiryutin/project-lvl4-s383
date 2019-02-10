module.exports = {
  up: queryInterface => queryInterface.addIndex('Users', ['email'], { unique: true }),
  down: queryInterface => queryInterface.removeIndex('Users', ['email']),
};
