import buildFormObj from '../lib/formObjectBuilder';
import pagination from '../lib/pagination';
import referer from '../lib/referer';
import { getParamUrl } from '../lib/utils';
import { User } from '../models';

const pageSize = 10;


export default (router) => {
  router
    .get('users', '/users', async (ctx) => { // список пользователей
      const { query } = ctx.request;
      const currentPage = query.page || 1;
      // const users = await User.findAll({
      const result = await User.findAndCountAll({
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
        order: ['lastName', 'firstName'],
      });
      // sequelize-pagination ?
      ctx.render('users', {
        users: result.rows,
        pages: pagination(result.count, pageSize, currentPage),
        paramUrl: getParamUrl(ctx), // для формирования ссылок
      });
    })

    .get('newUser', '/users/new', (ctx) => { // форма регистрация пользователя
      const user = User.build();
      referer.saveFor(ctx, 'newUser');
      ctx.render('users/new', { f: buildFormObj(user, User.attributes) });
    })

    .post('saveUser', '/users', async (ctx) => { // сохранение (нового) пользователя
      const form = ctx.request.body;
      const user = User.build(form);
      try {
        await user.save();
        ctx.flash.set({ type: 'success', text: `Пользователь '${user.fullName}' успешно зарегистрирован.` });
        ctx.redirect(router.url('root'));
      } catch (err) {
        ctx.render('users/new', { f: buildFormObj(user, User.attributes, err) });
      }
    })

    .get('showUser', '/users/:id', async (ctx) => { // просмотр пользователя
      const user = await User.findByPk(ctx.params.id);
      const access = {
        edit: ctx.state.auth.hasAccess('editUser', ctx.params.id),
        delete: ctx.state.auth.hasAccess('deleteUser', ctx.params.id),
      };
      referer.saveFor(ctx, ['showUser', 'deleteUser']);
      ctx.render('users/show', { user, access });
    })

    .get('editUser', '/users/:id/edit', async (ctx) => { // редактирование пользователя
      ctx.state.auth.checkAccess(ctx, ctx.params.id);

      const user = await User.findByPk(ctx.params.id);
      referer.saveFor(ctx, ['editUser', 'updateUser']); // для Cancel
      ctx.render('users/edit', { f: buildFormObj(user, User.attributes) });
    })

    .patch('updateUser', '/users/:id', async (ctx) => { // сохранение пользователя
      ctx.state.auth.checkAccess(ctx, ctx.params.id);

      const form = ctx.request.body;
      const user = await User.findByPk(ctx.params.id);
      try {
        await user.update(form);
        // ctx.flash.set({ type: 'success', text: `Изменения успешно сохранены.` });
        referer.prevent(ctx);
        ctx.redirect(router.url('showUser', user.id));
      } catch (err) {
        // referer.prevent(ctx); ?
        ctx.render('users/edit', { f: buildFormObj(user, User.attributes, err) });
      }
    })

    .delete('deleteUser', '/users/:id', async (ctx) => { // удаление пользователя
      ctx.state.auth.checkAccess(ctx, ctx.params.id);

      const user = await User.findByPk(ctx.params.id);
      await user.destroy();
      ctx.flash.set({ type: 'success', text: `Пользователь '${user.fullName}' успешно удален.` });
      // logout ?
      ctx.redirect(router.url('users'));
    });
};
