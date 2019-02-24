import { TaskStatus } from '../models';

export default (router) => {
  router
  /* .get('statuses', '/statuses', async (ctx) => {
      const statuses = await TaskStatus.findAll();
      ctx.render('statuses', { statuses });
    }) */

    .post('saveStatus', '/statuses', async (ctx) => { // сохранение (нового) статуса
      if (!ctx.state.auth.checkAccess(ctx)) {
        return;
      }
      const form = ctx.request.body;
      const status = TaskStatus.build(form);
      try {
        await status.save();
        ctx.redirect(router.url('root'));
      } catch (err) {
        // ctx.render('statuses/new', { f: buildFormObj(status, TaskStatus.attributes, err) });
      }
    })

    .get('statuses.json', '/api/statuses.json', async (ctx) => { // список статусов
      const statuses = await TaskStatus.findAll({
        attributes: ['id', 'name', 'color'],
      });
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({ statuses });
    });
};
