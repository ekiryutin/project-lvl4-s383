
export default {
  // сохранение ссылок для возврата потом обратно
  // refer.saveFor - сохранение обратной ссылки для заданного route
  // например, в форме просмотра для возврата после редактирования
  // в форме редактирования - для возврата по Cancel после ошибок
  // referFor(route) - получение ссылки в view

  saveFor(ctx, routes) {
    const referer = ctx.get('Referer'); // ctx.req.headers.referer;
    if (referer !== '') { // if prevent
      if (Array.isArray(routes)) {
        routes.forEach(route => ctx.state.referer.set(route, referer));
      } else {
        ctx.state.referer.set(routes, referer);
      }
      ctx.session.referer = new Map(ctx.state.referer);
    }
  },

  prevent(ctx) {
    ctx.set('Referrer-Policy', 'no-referrer');
  },
};
