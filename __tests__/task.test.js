import path from 'path';
import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import { sequelize } from '../app/models';
import app from '../app';
import {
  task, invalidTask, statuses,
} from './__fixtures__/data';
import {
  authenticate, testGET, testPATCH, testDELETE,
} from './common.test';

const makePath = filename => path.resolve(__dirname, `__fixtures__/${filename}`);
const testFile = makePath('file.png');


describe('task', () => {
  let server;
  let authCookie;

  const ownerTask = '/tasks/1';
  const otherTask = '/tasks/2';

  beforeAll(async () => {
    expect.extend(matchers);
    await sequelize.sync({ force: false });

    server = app().listen();

    authCookie = await authenticate(server);
  });

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

  it('createTask', async () => {
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
    await testGET(server, authCookie, tests);
  });

  it('updateTask', async () => {
    const tests = [
      { url: ownerTask, data: task, code: 302 }, // success
      { url: ownerTask, data: invalidTask, code: 200 }, // not saved
      { url: otherTask, data: task, code: 403 }, // forbidden
    ];
    await testPATCH(server, authCookie, tests);
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
    await testPATCH(server, authCookie, tests);
  });

  it('deleteTask', async () => {
    const tests = [
      { url: otherTask, code: 403 }, // forbidden
      { url: ownerTask, code: 302 }, // success
    ];
    await testDELETE(server, authCookie, tests);
  });

  const testJson = ['statuses.json', 'tasks.json'];
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

  afterAll((done) => {
    server.close();
    done();
  });
});
