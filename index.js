// @flow

// import '@babel/polyfill';

import path from 'path';
import Koa from 'koa';
import Pug from 'koa-pug';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import serve from 'koa-static';
import koaWebpack from 'koa-webpack';
import bodyParser from 'koa-bodyparser';
import session from 'koa-generic-session';
import flash from 'koa-flash-simple';
import _ from 'lodash';
import methodOverride from 'koa-methodoverride';
import Rollbar from 'rollbar';

import webpackConfig from './webpack.config';
import addRoutes from './routes';
import container from './container';
import Auth from './lib/Auth';

export default () => {
  const mode = process.env.NODE_ENV || 'development';
  const app = new Koa();

  if (mode !== 'test') {
    const rollbar = new Rollbar(process.env.ROLLBAR_ACCESS_TOKEN);
    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        rollbar.error(err, ctx.request);
      }
    });
  }
  app.keys = ['some secret hurr'];
  app.use(session(app));
  app.use(flash());
  app.use(async (ctx, next) => {
    ctx.state = {
      flash: ctx.flash,
      isSignedIn: () => ctx.session.userId !== undefined,
      userId: () => ctx.session.userId,
      userName: () => ctx.session.userName,
      auth: new Auth(ctx.session.userId),
      referer: new Map(ctx.session.referer || []),
      referFor: route => ctx.state.referer.get(route || ctx._matchedRouteName), // eslint-disable-line
    };
    await next();
  });

  app.use(bodyParser());
  app.use(methodOverride((req) => {
    // return req?.body?._method;
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      return req.body._method; // eslint-disable-line
    }
    return null;
  }));
  app.use(serve(path.join(__dirname, 'public'), {
    maxage: 10 * 60 * 1000, // cache 10 min
  }));

  if (mode === 'development') {
    koaWebpack({
      config: webpackConfig,
    }).then(m => app.use(m));
  }
  app.use(koaLogger());
  const router = new Router();
  addRoutes(router, container);
  app.use(router.allowedMethods());
  app.use(router.routes());

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    noCache: mode === 'development',
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
    ],
  });
  pug.use(app);
  return app;
};
