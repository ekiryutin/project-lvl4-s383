import { URL } from 'url';

const setUrlQueryParams = (url, params) => { // achtung - побочные эффекты, меняет url
  const keys = Object.keys(params);
  keys.forEach((param) => {
    const value = params[param];
    url.searchParams.delete(param);
    // if (param !== '')
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(param, v));
    } else {
      url.searchParams.append(param, value);
    }
  });
  return url;
};

export const getParamUrl = ctx => (params, fromUrl = ctx.url) => {
  const url = new URL(fromUrl, ctx.origin);
  setUrlQueryParams(url, params);
  return `${url.pathname}${url.search}`;
};

export const makeWhere = (query, conditions) => {
  const where = {};
  const params = Object.keys(query);

  conditions
    .filter(c => params.includes(c.param) && query[c.param])
    .forEach((c) => { where[c.field || c.param] = c.condition(query[c.param]); });
  // console.log(where);
  return where;
};
