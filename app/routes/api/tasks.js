import pagination from '../../lib/pagination';
// import { Task } from '../../models';
import Tasks from '../../domain/Tasks';

const pageSize = 10; // config

export default (router) => {
  router
    .get('tasks.json', '/api/tasks.json', async (ctx) => { // список заданий
      const { query } = ctx.request;
      const currentPage = query.page || 1;

      const result = await Tasks.find(query);

      ctx.type = 'application/json';
      ctx.body = JSON.stringify({
        tasks: result.rows,
        pages: pagination(ctx, result.count, pageSize, currentPage),
      });
    });
};
