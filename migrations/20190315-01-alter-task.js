
const createTrigger = (dialect, action) => {
  const triggerName = action === 'insert' ? 'taskAttachmentsAI' : 'taskAttachmentsAD';
  const procName = action === 'insert' ? 'taskAttachAmountIncrease' : 'taskAttachAmountDecrease';
  const sign = action === 'insert' ? '+' : '-';
  const rec = action === 'insert' ? 'new' : 'old';
  switch (dialect) {
    case 'sqlite':
      return `
CREATE TRIGGER ${triggerName}
AFTER ${action} ON "TaskAttachments"
FOR EACH ROW
BEGIN
  UPDATE "Tasks" set "attachAmount" = "attachAmount" ${sign} 1 where "Tasks"."id"=${rec}.TaskId;
END;`;

    case 'postgres':
      return `
CREATE OR REPLACE FUNCTION ${procName}() RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Tasks" set "attachAmount" = "attachAmount" ${sign} 1 where "Tasks"."id"=${rec}.TaskId;
  return new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ${triggerName}
AFTER ${action} ON "TaskAttachments"
FOR EACH ROW
EXECUTE PROCEDURE ${procName}();`;

    default:
      console.log(`Define trigger for '${dialect}' dialect`);
      return '';
  }
};

const dropTrigger = (dialect, triggerName) => {
  switch (dialect) {
    case 'sqlite':
      return `DROP TRIGGER ${triggerName};`;

    case 'postgres':
      return `DROP TRIGGER ${triggerName} on "TaskAttachments";`;

    default:
      console.log(`Define trigger for '${dialect}' dialect`);
      return '';
  }
};

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('Tasks',
    'attachAmount', { type: Sequelize.INTEGER, defaultValue: 0 })
    .then(() => queryInterface.bulkUpdate('Tasks', {
      attachAmount: Sequelize.literal('(SELECT count(*) FROM "TaskAttachments" WHERE "TaskAttachments"."TaskId" = "Tasks"."id")'),
    }))
    .then(() => queryInterface.sequelize.query(createTrigger(queryInterface.sequelize.getDialect(), 'insert')))
    .then(() => queryInterface.sequelize.query(createTrigger(queryInterface.sequelize.getDialect(), 'delete'))),

  down: queryInterface => queryInterface.sequelize.query(dropTrigger(queryInterface.sequelize.getDialect(), 'taskAttachmentsAI'))
    .then(() => queryInterface.sequelize.query(dropTrigger(queryInterface.sequelize.getDialect(), 'taskAttachmentsAD')))
    .then(() => queryInterface.removeColumn('Tasks', ['attachAmount']))
    // SQLite does not support DROP COLUMN
    .catch(() => console.log('   Warning: drop columns "Tasks"."attachAmount" manually!')),
};
