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
      const { email, password } = ctx.request.body;
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
      const message = { type: 'danger', text: 'Неправильный логин или пароль. Попробуйте еще раз.' };
      // ctx.flash.set(message);
      // без редиректа сообщение не рендерится, т.к. ctx.flash.get() сразу возвращает ничего
      ctx.render('sessions/new', { f: buildFormObj({ email }), message });
    })

    .delete('deleteSession', '/session', (ctx) => { // logout
      ctx.session = {};
      ctx.redirect(router.url('root'));
    });
};
