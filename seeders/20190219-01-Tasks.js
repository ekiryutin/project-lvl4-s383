const faker = require('faker');

const random = max => Math.round(Math.random() * (max - 1));

const generateTasks = (users, count) => {
  const tasks = [];
  // faker.locale = 'ru';
  for (let i = 0; i < count; i += 1) {
    const task = {
      name: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      dateTo: faker.date.between('2019-02-20', '2019-03-08'), // '2018-02-20'
      statusId: random(3) + 1,
      authorId: users[random(users.length)].id,
      executorId: users[random(users.length)].id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    tasks.push(task);
  }
  // console.log(tasks);
  return tasks;
};

module.exports = {
  up: queryInterface => queryInterface.sequelize.query(
    'select id from "Users"', { type: queryInterface.sequelize.QueryTypes.SELECT },
  )
    .then(users => queryInterface.bulkInsert('Tasks', generateTasks(users, 50), {})),

  down: queryInterface => queryInterface.bulkDelete('Tasks', null, {}),
};

// node_modules/.bin/sequelize db:seed:all --debug

// node_modules/.bin/sequelize db:seed:undo:all
