import path from 'path';
import request from 'supertest';
import faker from 'faker';
import matchers from 'jest-supertest-matchers';

import { sequelize } from '../app/models';
import app from '../app';

const user = {
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
};

const invalidUser = {
  email: 'none',
  password: faker.internet.password(),
};

const statuses = [
  { name: 'Новое', color: 'warning' },
  { name: 'В работе', color: 'info' },
  { name: 'Завершено', color: 'success' },
];

const task = {
  name: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  dateTo: '01.01.2019',
  statusId: 1, // + random(3)
  executorId: 1,
  executorName: 'неважно',
  tags: faker.lorem.word,
};

const invalidTask = {
  name: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  statusId: 1, // + random(3)
  executorId: null,
  executorName: '',
};

const makePath = filename => path.resolve(__dirname, `fixtures/${filename}`);
const testFile = makePath('file.png');

describe('guest', () => { // -------------------------------
  let server;

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: false });
  });

  beforeEach(() => {
    server = app().listen();
  });

  /* it('GET root', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200); // хз, не работает
  }); */

  it('root', async () => {
    await request.agent(server)
      .get('/')
      .expect(200);
  });

  it('404', async () => {
    await request.agent(server)
      .get('/wrong-path')
      .expect(404);
  });

  it('createUser', async () => {
    await request.agent(server)
      .get('/users/new')
      .expect(200);

    await request.agent(server)
      .post('/users')
      .send(user)
      .expect(302);

    await request.agent(server)
      .post('/users')
      .send(user) // same not saved
      .expect(200);
  });

  it('users', async () => {
    await request.agent(server)
      .get('/users')
      .expect(200);
  });

  it('showUser', async () => {
    await request.agent(server)
      .get('/users/1')
      .expect(200);
  });

  it('login', async () => {
    await request.agent(server)
      .get('/session/new')
      .expect(200);

    await request.agent(server)
      .post('/session')
      .send(invalidUser)
      .expect(200); // not logged

    await request.agent(server)
      .post('/session')
      .send(user)
      .expect(302);
  });

  afterEach((done) => {
    server.close();
    done();
  });
});

describe('signed', () => { // -------------------------------
  let server;
  let authCookie;

  const curUser = '/users/1';
  const otherUser = '/users/2';

  const ownerTask = '/tasks/1';
  const otherTask = '/tasks/2';

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: false });

    server = app().listen();

    await request.agent(server) // add user
      .post('/users')
      .send(user);

    const response = await request.agent(server) // login
      .post('/session')
      .send(user);
    authCookie = response.headers['set-cookie'];
  });

  const testGET = async (tests) => {
    await Promise.all(tests.map(test => request.agent(server)
      .get(test.url)
      .set('Cookie', authCookie)
      .expect(test.code)));
  };

  const testPATCH = async (tests) => {
    await Promise.all(tests.map(test => request.agent(server)
      .patch(test.url)
      .set('Cookie', authCookie)
      .send(test.data)
      .expect(test.code)));
  };

  const testDELETE = async (tests) => {
    await Promise.all(tests.map(test => request.agent(server)
      .delete(test.url)
      .set('Cookie', authCookie)
      .expect(test.code)));
  };

  const testUpload = async (tests) => {
    tests.forEach(async (test) => {
      await request.agent(server)
        .post('/attachments')
        .set('Cookie', authCookie)
        .field('attachTo', test.attachTo)
        .attach('file', test.file)
        .expect(test.code)
        .then(response => request.agent(server)
          .post(test.attachTo)
          .set('Cookie', authCookie)
          .send({ AttachmentId: response.body.id })
          .expect(200, { type: 'success', text: 'Файл успешно прикреплен.' }));
    });
  };

  it('showUser', async () => {
    await request.agent(server)
      .get('/users/1') // curUser
      .expect(200);
  });

  it('addStatuses', async () => {
    await request.agent(server)
      .post('/statuses')
      .send(statuses[0])
      .expect(403); // forbidden

    statuses.forEach(async (status) => {
      await request.agent(server)
        .post('/statuses')
        .set('Cookie', authCookie)
        .send(status)
        .expect(302);
    });
  });

  it('createTask', async () => { // -----------------------------------
    await request.agent(server)
      .get('/tasks/new')
      .set('Cookie', authCookie)
      .expect(200);

    await request.agent(server)
      .post('/tasks')
      .set('Cookie', authCookie)
      .send(invalidTask)
      .expect(200); // not saved

    await request.agent(server)
      .post('/tasks')
      .set('Cookie', authCookie)
      .send(task)
      .expect(302); // success
  });

  it('tasks', async () => {
    await request.agent(server)
      .get('/tasks')
      .set('Cookie', authCookie)
      .expect(200);
  });

  it('showTask', async () => {
    await request.agent(server)
      .get(ownerTask)
      .expect(200);
  });

  it('editTask', async () => {
    const tests = [
      { url: `${otherTask}/edit`, code: 403 }, // forbidden
      { url: `${ownerTask}/edit`, code: 200 }, // success
    ];
    await testGET(tests);
  });

  it('updateTask', async () => {
    const tests = [
      { url: ownerTask, data: task, code: 302 }, // success
      { url: ownerTask, data: invalidTask, code: 200 }, // not saved
      { url: otherTask, data: task, code: 403 }, // forbidden
    ];
    await testPATCH(tests);
  });

  it('attachTask', async () => {
    const tests = [
      { attachTo: `${ownerTask}/attachment`, file: testFile, code: 200 }, // success
      // { url: ownerTask, data: invalidTask, code: 200 }, // not saved
      // { url: otherTask, data: task, code: 403 }, // forbidden
    ];
    await testUpload(tests);
  });

  it('statusTask', async () => {
    const tests = [
      { url: `${ownerTask}/status`, data: { statusId: 2 }, code: 302 }, // success
      { url: `${ownerTask}/status`, data: { statusId: -1 }, code: 302 }, // with flash
      { url: `${otherTask}/status`, data: { statusId: 2 }, code: 403 }, // forbidden
    ];
    await testPATCH(tests);
  });

  it('deleteTask', async () => {
    const tests = [
      { url: otherTask, code: 403 }, // forbidden
      { url: ownerTask, code: 302 }, // success
    ];
    await testDELETE(tests);
  });

  it('editUser', async () => { // -----------------------------------
    const tests = [
      { url: `${otherUser}/edit`, code: 403 }, // forbidden
      { url: `${curUser}/edit`, code: 200 }, // success
    ];
    await testGET(tests);
  });

  it('updateUser', async () => {
    const tests = [
      { url: curUser, data: user, code: 302 }, // success
      { url: curUser, data: invalidUser, code: 200 }, // not saved
      { url: otherUser, data: user, code: 403 }, // forbidden
    ];
    await testPATCH(tests);
  });

  const testJson = ['users.json', 'statuses.json', 'tasks.json'];
  testJson.forEach((url) => {
    it(url, async () => {
      await request.agent(server)
        .get(`/api/${url}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
      // .expect((res) => {
      //  console.log(url, res.body);
      // });
    });
  });

  it('deleteUser', async () => {
    const tests = [
      { url: otherUser, code: 403 }, // forbidden
      { url: curUser, code: 302 }, // success
    ];
    await testDELETE(tests);
  });

  it('logout', async () => {
    await request.agent(server)
      .delete('/session')
      .expect(302);
  });

  afterAll((done) => {
    server.close();
    done();
  });
});
