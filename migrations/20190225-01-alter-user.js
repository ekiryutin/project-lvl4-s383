module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Users',
    'deletedAt', { type: Sequelize.DATE })
    .then(() => queryInterface.addIndex('Users', ['deletedAt'])),

  down: queryInterface => queryInterface.removeIndex('Users', ['deletedAt'])
    // .then(() => queryInterface.removeColumn('Users', 'deletedAt')),
    // SQLite does not support DROP COLUMN
    .then(() => console.log('   Warning: drop column "Users"."deletedAt" manually! ')),
};
