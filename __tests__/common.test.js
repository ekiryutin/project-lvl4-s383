import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import { user } from './__fixtures__/data';
import { sequelize } from '../app/models';
import app from '../app';

describe('common', () => {
  let server;

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: false });
  });

  beforeAll(() => {
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

  afterAll((done) => {
    server.close();
    done();
  });
});


export const authenticate = async (server) => {
  await request.agent(server) // create user
    .post('/users')
    .send(user);

  const response = await request.agent(server) // login
    .post('/session')
    .send(user);
  const authCookie = response.headers['set-cookie'];
  return authCookie;
};

export const testGET = async (server, authCookie, tests) => {
  await Promise.all(tests.map(test => request.agent(server)
    .get(test.url)
    .set('Cookie', authCookie)
    .expect(test.code)));
};

export const testPATCH = async (server, authCookie, tests) => {
  await Promise.all(tests.map(test => request.agent(server)
    .patch(test.url)
    .set('Cookie', authCookie)
    .send(test.data)
    .expect(test.code)));
};

export const testDELETE = async (server, authCookie, tests) => {
  await Promise.all(tests.map(test => request.agent(server)
    .delete(test.url)
    .set('Cookie', authCookie)
    .expect(test.code)));
};
