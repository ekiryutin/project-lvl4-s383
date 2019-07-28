import StatisticService from '../services/StatisticService';

export default (router) => {
  router
    .get('statistics', '/statistics', async (ctx) => {
      ctx.redirect(router.url('statPersonsStatuses'));
    })

    .get('statPersonsStatuses', '/statistics/persons/statuses', async (ctx) => {
      const chartInfo = await StatisticService.personsStatuses();

      ctx.render('statistics/index', {
        chartInfo,
      });
    });
};
