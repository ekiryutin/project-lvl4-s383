import { TaskSummary } from '../models';

export default {
  get: async (filters) => { // загрузка
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
};
