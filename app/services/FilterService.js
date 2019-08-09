import _ from 'lodash';
import { getParamUrl, replaceObjectValue } from '../lib/utils';
// import { Filter } from '../models';

const filterPresets = `[
    {
      "name": "Новые",
      "status": "danger",
      "priority": 1,
      "params": {
        "statusId": [1, 4],
        "executorId": "$userId",
        "executorName": "$userName"
      }
    },
    {
      "name": "На исполнении",
      "status": "process",
      "priority": 3,
      "params": {
        "statusId": [2],
        "executorId": "$userId",
        "executorName": "$userName"
      }
    },
    {
      "name": "На проверку",
      "status": "warning",
      "priority": 2,
      "params": {
        "statusId": [3],
        "authorId": "$userId",
        "authorName": "$userName"
      }
    }
  ]`;

const getPresets = async (userId = '', userName = '') => {
  // if (filterPresets === null) {
  //   загрузить из БД

  const presets = JSON.parse(filterPresets);
  return presets
    .map(obj => replaceObjectValue(obj, '$userId', userId))
    .map(obj => replaceObjectValue(obj, '$userName', userName));
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
    const userPresets = await getPresets(ctx.session.userId, ctx.session.userName);

    const paramUrl = getParamUrl(ctx);
    const filters = userPresets.map((filter) => {
      const link = paramUrl(filter.params, ctx.path);
      return { ...filter, link };
    });
    // определение текущего фильтра
    const cur = userPresets.find(f => compareQuery(f.params, ctx.query));
    return { name: cur ? cur.name : '', filters, userId: ctx.session.userId };
  },
};
