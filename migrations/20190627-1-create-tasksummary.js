const fillSummary = `
insert into "TaskSummary" ("userId", "statusId", "amount")
select 
  case 
    when "statusId" in (select "fromId" from "StatusTransitions" where "access" = 'author') 
    then "authorId" 
    else "executorId" 
  end as "userId", 
  "statusId",
  count(*) as "amount"
from "Tasks" 
where "deletedAt" is null
group by "userId", "statusId";`;

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('TaskSummary', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      // references: { model: 'Users', key: 'id' },
    },
    statusId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      // references: { model: 'TaskStatuses', key: 'id' },
    },
    amount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  })

    .then(() => queryInterface.addConstraint('TaskSummary', ['userId', 'statusId'], {
      type: 'unique',
    }))
    .then(() => queryInterface.addIndex('TaskSummary', ['userId', 'statusId']))

    .then(() => queryInterface.sequelize.query(fillSummary)),

  down: queryInterface => queryInterface.dropTable('TaskSummary'),
};
