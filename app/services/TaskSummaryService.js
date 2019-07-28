import { TaskSummary, Sequelize } from '../models';

const { Op } = Sequelize;

export default {
  get: async (filters) => { // загрузка для quick filter
    const summary = await TaskSummary.findAll({
      where: { userId: Number(filters.userId || -1) },
    });

    // фильтруем и суммируем нужные статусы
    const filtersWithAmount = filters.filters.map((filter) => {
      const amount = summary
        .filter(rec => filter.params.statusId.includes(rec.statusId))
        .reduce((acc, rec) => acc + rec.amount, 0);
      return { ...filter, amount };
    });

    const sorted = filtersWithAmount.filter(rec => rec.amount > 0)
      .sort((a, b) => a.priority - b.priority);

    return {
      name: filters.name,
      filters: filtersWithAmount,
      notify: sorted.length > 0 ? sorted[0].status : null,
    };
  },

  find: async (query) => { // загрузка данных
    const where = {};
    if (query.users) {
      where.userId = { [Op.in]: query.users };
    }

    const summary = await TaskSummary.findAll({
      where,
    });
    return summary;
  },
};
