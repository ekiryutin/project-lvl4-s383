
export default {
  save(ctx) {
    ctx.cookies.set('referer', ctx.req.headers.referer);
    // ctx.state.referer = referer;
    this.ctx = ctx;
  },

  get() {
    return this.ctx.cookies.get('referer');
    // return ctx.state.referer;
  },
};
