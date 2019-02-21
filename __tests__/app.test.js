import request from 'supertest';
import faker from 'faker';
import matchers from 'jest-supertest-matchers';

import { sequelize } from '../models';
import app from '..';

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

describe('users (guest)', () => { // -------------------------------
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
      .expect(302)
      .expect('Location', '/');

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
      .expect(302)
      .expect('Location', '/');
  });

  afterEach((done) => {
    server.close();
    done();
  });
});

describe('users (signed)', () => { // -------------------------------
  let server;
  let authCookie;

  const curUser = '/users/1';
  const otherUser = '/users/2';

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: false });
  });

  beforeEach(async () => {
    server = app().listen();

    await request.agent(server) // add user
      .post('/users')
      .send(user);

    const response = await request.agent(server) // login
      .post('/session')
      .send(user);
    authCookie = response.headers['set-cookie'];
  });

  it('editUser', async () => {
    await request.agent(server)
      .get(`${curUser}/edit`)
      .set('Cookie', authCookie)
      .expect(200); // success

    await request.agent(server)
      .get(`${otherUser}/edit`)
      .set('Cookie', authCookie)
      .expect(403); // forbidden
  });

  it('updateUser', async () => {
    await request.agent(server)
      .patch(curUser)
      .set('Cookie', authCookie)
      .send(user)
      .expect(302); // success

    await request.agent(server)
      .patch(curUser)
      .set('Cookie', authCookie)
      .send(invalidUser)
      .expect(200); // not saved

    await request.agent(server)
      .patch(otherUser)
      .set('Cookie', authCookie)
      .send(user)
      .expect(403); // forbidden
  });

  it('deleteUser', async () => {
    await request.agent(server)
      .delete(curUser)
      .set('Cookie', authCookie)
      .expect(302); // success

    await request.agent(server)
      .delete(otherUser)
      .set('Cookie', authCookie)
      .expect(403); // forbidden
  });

  it('logout', async () => {
    await request.agent(server)
      .delete('/session')
      .expect(302)
      .expect('Location', '/');
  });

  afterEach((done) => {
    server.close();
    done();
  });
});

describe('tasks', () => { // -------------------------------
  let server;

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: false });
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('tasks', async () => {
    await request.agent(server)
      .get('/tasks')
      .expect(200);
  });

  /* it('createTask', async () => {
    await request.agent(server)
      .get('/tasks/new')
      .expect(200);

    await request.agent(server)
      .post('/tasks')
      .send(task)
      .expect(302)
      .expect('Location', '/tasks');
  });

  it('showTask', async () => {
    await request.agent(server)
      .get('/tasks/1')
      .expect(200);
  }); */

  afterEach((done) => {
    server.close();
    done();
  });
});

describe('api', () => { // -------------------------------
  let server;

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: false });
  });

  beforeEach(() => {
    server = app().listen();
  });

  const testUrl = ['users.json', 'tasks.json'];
  testUrl.forEach((url) => {
    it(url, async () => {
      await request.agent(server)
        .get(`/api/${url}`)
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8');
    });
  });

  afterEach((done) => {
    server.close();
    done();
  });
});
