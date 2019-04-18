import { TaskStatus } from '../models';

export default (router) => {
  router
    .post('saveStatus', '/statuses', async (ctx) => { // сохранение (нового) статуса
      ctx.state.auth.checkAccess(ctx);

      const form = ctx.request.body;
      const status = TaskStatus.build(form);
      try {
        await status.save();
        ctx.redirect(router.url('root'));
      } catch (err) {
        // ctx.render('statuses/new', { f: buildFormObj(status, TaskStatus.attributes, err) });
      }
    });
};
