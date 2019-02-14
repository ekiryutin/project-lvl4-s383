import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';
import { User } from '../models';

export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => { // login
      const data = {};
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })

    .post('session', '/session', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      const user = await User.findOne({
        where: {
          email,
        },
      });
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.session.userName = user.firstName;
        // можно загрузить роли (доступные сервисы) и сохранить в кеш
        ctx.redirect(router.url('root'));
        return;
      }

      ctx.flash.set({ type: 'danger', text: 'Неправильный логин или пароль. Попробуйте еще раз.' });
      // ctx.render('sessions/new', { f: buildFormObj({ email }) });
      ctx.redirect(router.url('newSession'));
    })

    .delete('deleteSession', '/session', (ctx) => { // logout
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
