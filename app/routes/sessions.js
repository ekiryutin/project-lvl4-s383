import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';
import referer from '../lib/referer';
import { User } from '../models';

export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => { // форма логина
      const data = {};
      referer.saveFor(ctx, ['newSession', 'session']);
      ctx.render('sessions/new', { f: buildFormObj(data) });
    })

    .post('session', '/session', async (ctx) => { // логин
      const { email, password } = ctx.request.body;
      const user = await User.findOne({
        where: {
          email,
        },
      });
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.session.userName = user.fullName;
        // можно загрузить роли (доступные сервисы) и сохранить в кеш

        // ctx.redirect(router.url('root'));
        referer.prevent(ctx);
        ctx.redirect(ctx.state.referFor()); // возврат обратно
        return;
      }
      const message = { type: 'danger', text: 'Неправильный логин или пароль. Попробуйте еще раз.' };
      referer.prevent(ctx);
      ctx.render('sessions/new', { f: buildFormObj({ email }), message });
    })

    .delete('deleteSession', '/session', (ctx) => { // logout
      ctx.session = {};

      // ctx.redirect(router.url('root'));
      referer.prevent(ctx);
      ctx.redirect(ctx.get('Referer')); // возврат обратно
    });
};
