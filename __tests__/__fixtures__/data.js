import faker from 'faker';

export const user = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

export const invalidUser = {
  email: 'none',
  password: faker.internet.password(),
};

export const statuses = [
  { name: 'Новое', color: 'warning' },
  { name: 'В работе', color: 'info' },
  { name: 'Завершено', color: 'success' },
];

export const task = {
  name: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  dateTo: '01.01.2019',
  statusId: 1, // + random(3)
  executorId: 1,
  executorName: 'неважно',
  tags: faker.lorem.word,
};

export const invalidTask = {
  name: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  statusId: 1, // + random(3)
  executorId: null,
  executorName: '',
};
