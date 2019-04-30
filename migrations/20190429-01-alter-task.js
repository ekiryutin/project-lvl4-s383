
// const removeConstraint = userType => `ALTER TABLE "Tasks"
// DROP CONSTRAINT "Tasks_${userType}Id_Users_fk";`;

const updateTasks = userType => `UPDATE "Tasks" SET "${userType}Name" =
(SELECT "lastName"||' '||"firstName" FROM "Users" WHERE "Users"."id" = "Tasks"."${userType}Id");`;

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Tasks',
    'authorName', { type: Sequelize.STRING })
    .then(() => queryInterface.sequelize.query(updateTasks('author')))
    .then(() => queryInterface.addColumn('Tasks', 'executorName', { type: Sequelize.STRING }))
    .then(() => queryInterface.sequelize.query(updateTasks('executor')))
  // .then(() => queryInterface.removeConstraint('Tasks', 'Tasks_authorId_Users_fk'))
  // .then(() => queryInterface.removeConstraint('Tasks', 'Tasks_executorId_Users_fk'))
  // .then(() => queryInterface.sequelize.query(removeConstraint('author')))
  // .then(() => queryInterface.sequelize.query(removeConstraint('executor')))
  // SQLite does not support DROP CONSTRAINT
    .then(() => console.log('   Warning: drop constraints "Tasks"to "Users" manually!')),

  down: queryInterface => queryInterface.addConstraint('Tasks', ['authorId'], {
    type: 'foreign key',
    references: { table: 'Users', field: 'id' },
  })
    .then(() => queryInterface.addConstraint('Tasks', ['executorId'], {
      type: 'foreign key',
      references: { table: 'Users', field: 'id' },
    }))
    .then(() => queryInterface.removeColumn('Tasks', ['authorName']))
    .then(() => queryInterface.removeColumn('Tasks', ['executorName']))
    // SQLite does not support DROP COLUMN
    .catch(() => console.log('   Warning: drop columns "Tasks"."authorName" & "executorName" manually!')),
};
