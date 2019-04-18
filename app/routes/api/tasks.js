import { makeWhere, pageSize, queryInclude } from '../tasks';
import pagination from '../../lib/pagination';
import { Task } from '../../models';

export default (router) => {
  router
    .get('tasks.json', '/api/tasks.json', async (ctx) => { // список заданий
      const { query } = ctx.request;
      const currentPage = query.page || 1;
      const result = await Task.findAndCountAll({
        include: queryInclude,
        where: makeWhere(query),
        subQuery: false,
        order: ['dateTo'],
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
      });
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({
        tasks: result.rows,
        pages: pagination(ctx, result.count, pageSize, currentPage),
      });
    });
};
