import { URL } from 'url';

export const getParamUrl = ctx => (params, fromUrl = ctx.url) => {
  const url = new URL(fromUrl, ctx.origin);
  const keys = Object.keys(params);
  keys.forEach((param) => {
    if (params[param] !== '') url.searchParams.set(param, params[param]);
    else url.searchParams.delete(param);
  });
  return `${url.pathname}${url.search}`;
};

export const makeWhere = (query, conditions) => {
  const where = {};
  const params = Object.keys(query);

  conditions
    .filter(c => params.includes(c.param) && query[c.param])
    .forEach((c) => { where[c.field || c.param] = c.condition(query[c.param]); });
  console.log(where);
  return where;
};
