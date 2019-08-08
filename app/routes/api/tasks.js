import dateFns from 'date-fns';
import pagination from '../../lib/pagination';
// import { Task } from '../../models';
import TaskService from '../../services/TaskService';

const pageSize = 10; // config

export default (router) => {
  router
    .get('tasks.json', '/api/tasks.json', async (ctx) => { // список заданий
      const { query } = ctx.request;
      const currentPage = query.page || 1;

      const result = await TaskService.find(query);

      ctx.type = 'application/json';
      ctx.body = JSON.stringify({
        tasks: result.rows,
        pages: pagination(ctx, result.count, pageSize, currentPage),
      });
    })

    // наличие заданий по дням для календаря
    .get('taskDaily.json', '/api/tasks/daily.json', async (ctx) => {
      const query = {
        executorId: ctx.state.userId(),
        statusId: [1, 2, 3, 4], // кроме 'Выполнено'
      };
      const result = await TaskService.find(query, 1000);

      const daysInfo = result.rows // группируем информацию по датам
        .filter(rec => rec.dateTo !== null) // без срока
        .reduce((acc, rec) => {
          const date = dateFns.parse(rec.dateTo, 'dd.MM.yyyy', new Date()).toDateString(); // криво
          const cur = acc[date] || { statuses: [], amount: 0 };
          cur.statuses.push(rec.statusId);
          cur.amount += 1;
          acc[date] = cur;
          return acc;
        }, {});

      const days = Object.keys(daysInfo);
      // задаем стили (можно сделать цветные точки в зависимости от статусов задач)
      const daysView = days.reduce((acc, day) => {
        const amount = Math.min(daysInfo[day].amount, 3); // не более 3 точек
        acc[day] = `day-info-${amount}`;
        return acc;
      }, {});

      ctx.type = 'application/json';
      ctx.body = JSON.stringify(daysView);
    });
};
