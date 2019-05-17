import { URL } from 'url';

export const none = null; // убрать, когда будет еще одна функция

export const getParamUrl = ctx => (params) => {
  const url = new URL(ctx.url, ctx.origin);
  const keys = Object.keys(params);
  keys.forEach((param) => {
    if (params[param] !== '') url.searchParams.set(param, params[param]);
    else url.searchParams.delete(param);
  });
  return `${url.pathname}${url.search}`;
};
