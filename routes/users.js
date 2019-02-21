import _ from 'lodash';
import buildFormObj from '../lib/formObjectBuilder';
import pagination from '../lib/pagination';
import { User, Sequelize } from '../models';

const { Op } = Sequelize;
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
      const users = result.rows;
      // для pagination рекомендуется использовать sequelize-pagination
      ctx.render('users', {
        users,
        currentUser: ctx.session.userId,
        pages: pagination(ctx, result.count, pageSize, currentPage),
      });
    })

    .get('newUser', '/users/new', (ctx) => { // регистрация пользователя
      const user = User.build();
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
      ctx.render('users/show', { user, access });
    })

    .get('editUser', '/users/:id/edit', async (ctx) => { // редактирование пользователя
      if (!ctx.state.auth.checkAccess(ctx, ctx.params.id)) {
        return;
      }
      const user = await User.findByPk(ctx.params.id);
      ctx.render('users/edit', { f: buildFormObj(user, User.attributes) });
    })

    .patch('updateUser', '/users/:id', async (ctx) => { // сохранение пользователя
      if (!ctx.state.auth.checkAccess(ctx, ctx.params.id)) {
        return;
      }
      const form = ctx.request.body;
      const user = await User.findByPk(ctx.params.id);
      try {
        await user.update(form);
        // ctx.flash.set({ type: 'success', text: `Изменения успешно сохранены.` });
        ctx.redirect(router.url('showUser', user.id));
      } catch (err) {
        ctx.render('users/edit', { f: buildFormObj(user, User.attributes, err) });
      }
    })

    .delete('deleteUser', '/users/:id', async (ctx) => { // удаление пользователя
      if (!ctx.state.auth.checkAccess(ctx, ctx.params.id)) {
        return;
      }
      const user = await User.findByPk(ctx.params.id);
      await user.destroy();
      ctx.flash.set({ type: 'success', text: `Пользователь '${user.fullName}' успешно удален.` });
      // logout ?
      ctx.redirect(router.url('users'));
    })

    .get('users.json', '/api/users.json', async (ctx) => { // список пользователей
      const { query } = ctx.request;
      const name = _.upperFirst(_.lowerCase(query.name));
      const users = await User.findAll({
        // attributes: ['id', 'firstName', 'lastName'],
        where: {
          // firstName: { [Op.like]: `${name}%` },
          [Op.or]: [
            { firstName: { [Op.like]: `${name}%` } },
            { lastName: { [Op.like]: `${name}%` } },
          ],
        },
        order: ['lastName', 'firstName'],
      });
      const data = users.map(user => ({ id: user.id, name: user.fullName }));
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({ users: data });
    });
};
