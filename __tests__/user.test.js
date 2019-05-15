import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import { sequelize } from '../app/models';
import app from '../app';
import { user, invalidUser } from './__fixtures__/data';
import {
  authenticate, testGET, testPATCH, testDELETE,
} from './common.test';


describe('guest', () => {
  let server;

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: false });
  });

  beforeEach(() => {
    server = app().listen();
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

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: false });

    server = app().listen();

    authCookie = await authenticate(server);
  });

  it('showUser', async () => {
    await request.agent(server)
      .get(curUser)
      .expect(200);
  });

  it('editUser', async () => {
    const tests = [
      { url: `${otherUser}/edit`, code: 403 }, // forbidden
      { url: `${curUser}/edit`, code: 200 }, // success
    ];
    await testGET(server, authCookie, tests);
  });

  it('updateUser', async () => {
    const tests = [
      { url: curUser, data: user, code: 302 }, // success
      { url: curUser, data: invalidUser, code: 200 }, // not saved
      { url: otherUser, data: user, code: 403 }, // forbidden
    ];
    await testPATCH(server, authCookie, tests);
  });

  const testJson = ['users.json'];
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
    await testDELETE(server, authCookie, tests);
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
