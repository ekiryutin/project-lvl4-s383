// import zlib from 'zlib';

export default (ctx, template, params) => {
  if (ctx.state.chunks === 0) {
    // init chunked response
    ctx.status = 200;
    ctx.set({
      'Content-Type': 'text/html; charset=UTF-8',
      'Transfer-Encoding': 'chunked',
    });
    // ctx.res.removeHeader('Content-Length');
    ctx.response.flushHeaders();
    ctx.respond = false; // disable defalt koa response
  }
  ctx.render(template, params);
  const res = ctx.body;
  // ctx.res.write(`${res}\r\n`); // flushed
  // if (ctx.acceptsEncodings('gzip')) {
  ctx.res.write(res);
  ctx.state.chunks += 1;
};
