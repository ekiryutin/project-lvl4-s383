import FilterService from '../services/FilterService';
import TaskSummaryService from '../services/TaskSummaryService';

const getTaskInfo = async (ctx) => {
  if (!ctx.state.isSignedIn()) return [];

  const filters = await FilterService.getFilters(ctx);
  return TaskSummaryService.get(filters);
};

export default (router) => {
  router.get('root', '/', async (ctx) => {
    const taskInfo = await getTaskInfo(ctx);
    console.log('taskInfo', JSON.stringify(taskInfo));
    ctx.render('welcome/index', {
      taskInfo,
    });
  });
};
