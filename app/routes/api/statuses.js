import { TaskStatus } from '../../models';

export default (router) => {
  router
    .get('statuses.json', '/api/statuses.json', async (ctx) => { // список статусов
      const statuses = await TaskStatus.findAll({
        attributes: ['id', 'name', 'color'],
      });
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({ statuses });
    });
};
