import { URL } from 'url';

export default (ctx, recordCount, pageSize, currentPage) => {
  const pageCount = Math.ceil(recordCount / pageSize);
  const url = new URL(ctx.url, ctx.origin);
  url.searchParams.set('page', ''); // delete current page
  return {
    pageCount,
    pageSize,
    currentPage,
    recordCount,
    searchurl: `${url.pathname}${url.search}`,
  };
};
