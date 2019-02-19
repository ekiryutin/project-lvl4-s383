const faker = require('faker');

const generateUsers = (count) => {
  const users = [];
  // faker.locale = 'ru';
  for (let i = 0; i < count; i += 1) {
    const user = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(user);
  }
  // console.log(users);
  return users;
};

const users = generateUsers(27);

module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Users', users, {}),

  down: queryInterface => queryInterface.bulkDelete('Users', null, {}),
};

// node_modules/.bin/sequelize db:seed:all --debug

// node_modules/.bin/sequelize db:seed:undo:all
