import buildFormObj from '../lib/formObjectBuilder';
import referer from '../lib/referer';
import { User } from '../models';

export default (router) => {
  router
    // список пользователей
    .get('users', '/users', async (ctx) => {
      const users = await User.findAll();
      ctx.render('users', { users });
    })
    // добавление пользователя
    .get('newUser', '/users/new', (ctx) => {
      referer.save(ctx);
      const user = User.build();
      ctx.render('users/new', { f: buildFormObj(user, User.attributes), referer });
    })
    // сохранение (нового) пользователя
    .post('users', '/users', async (ctx) => {
      const { request: { body: form } } = ctx;
      // const form = ctx.request.body.form;
      const user = User.build(form.form);
      try {
        await user.save();
        ctx.flash.set({ type: 'success', text: `Пользователь ${user.fullName} успешно зарегистрирован.` });
        ctx.redirect(router.url('root')); // redirect to users?
      } catch (err) {
        ctx.render('users/new', { f: buildFormObj(user, User.attributes, err), referer });
      }
    });
};
