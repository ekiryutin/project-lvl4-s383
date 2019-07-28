import FilterService from '../services/FilterService';
import TaskSummaryService from '../services/TaskSummaryService';
import StatisticService from '../services/StatisticService';

const getTaskInfo = async (ctx) => {
  if (!ctx.state.isSignedIn()) return [];

  const filters = await FilterService.getFilters(ctx);
  return TaskSummaryService.get(filters);
};

export default (router) => {
  router.get('root', '/', async (ctx) => {
    const taskInfo = await getTaskInfo(ctx);

    const chartInfo = await StatisticService.userStatuses(ctx.session.userId);

    ctx.render('welcome/index', {
      taskInfo,
      chartInfo,
    });
  });
};
