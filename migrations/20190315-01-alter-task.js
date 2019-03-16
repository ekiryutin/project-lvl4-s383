module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Tasks',
    'attachAmount', { type: Sequelize.INTEGER, defaultValue: 0 })
    .then(() => queryInterface.bulkUpdate('Tasks', {
      attachAmount: Sequelize.literal('(SELECT count(*) FROM "TaskAttachments" WHERE "TaskAttachments"."TaskId" = "Tasks"."id")'),
    }))
    .then(() => queryInterface.sequelize.query('CREATE TRIGGER "task_attach_increase"'
      + ' AFTER INSERT ON "TaskAttachments" '
      + ' FOR EACH ROW '
      + ' BEGIN '
      + '   UPDATE "Tasks" set "attachAmount" = "attachAmount" + 1 where "id"=new.TaskId; '
      + ' END; '))
    .then(() => queryInterface.sequelize.query('CREATE TRIGGER "task_attach_decrease"'
      + ' AFTER DELETE ON "TaskAttachments" '
      + ' FOR EACH ROW '
      + ' BEGIN '
      + '   UPDATE "Tasks" set "attachAmount" = "attachAmount" - 1 where "id"=old.TaskId; '
      + ' END; ')),

  down: queryInterface => queryInterface.sequelize.query('DROP TRIGGER "task_attach_increase";')
    .then(() => queryInterface.sequelize.query('DROP TRIGGER "task_attach_decrease";'))
    .then(() => queryInterface.removeColumn('Tasks', ['attachAmount']))
    // SQLite does not support DROP COLUMN
    .catch(() => console.log('   Warning: drop columns "Tasks"."attachAmount" manually!')),
};
