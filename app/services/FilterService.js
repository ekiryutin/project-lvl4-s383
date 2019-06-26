import _ from 'lodash';
// import { URLSearchParams } from 'url';
import { getParamUrl } from '../lib/utils';
// import { Filter } from '../models';

let filterPresets = null;

const getPresets = async (userId = '', userName = '') => { // можно загружать из БД
  // if (filterPresets === null) {
  filterPresets = [
    {
      name: 'Новые',
      params: {
        statusId: [1, 4], // Новое, Отклонено
        executorId: userId,
        executorName: userName,
      },
    },
    {
      name: 'На исполнении',
      params: {
        statusId: [2], // В работе
        executorId: userId,
        executorName: userName,
      },
    },
    {
      name: 'На проверку',
      params: {
        statusId: [3], // Выполнено
        authorId: userId,
        authorName: userName,
      },
    },
  ];
  return filterPresets;
};

const compareValues = (first, second) => {
  const normalize = value => (Array.isArray(value) ? value.sort().toString() : value.toString());

  return normalize(first) === normalize(second);
};

const compareQuery = (filter, query) => {
  const filterParams = Object.keys(filter);
  const queryParams = Object.keys(query);

  // проверка наличия всех параметров фильтра в адресной строке
  const dif = _.difference(filterParams, queryParams);
  if (dif.length > 0) return false;

  return filterParams
    .reduce((acc, param) => acc && compareValues(filter[param], query[param]), true);
};

export default {
  getFilters: async (ctx) => {
    await getPresets(ctx.session.userId, ctx.session.userName);

    const paramUrl = getParamUrl(ctx);
    const filters = filterPresets.map((filter) => {
      const link = paramUrl(filter.params, ctx.path);
      return { ...filter, link };
    });
    // определение текущего фильтра
    const cur = filterPresets.find(f => compareQuery(f.params, ctx.query));
    return { name: cur ? cur.name : '', filters };
  },
};
