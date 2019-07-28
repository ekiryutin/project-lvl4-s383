import TaskStatusService from './TaskStatusService';
import TaskSummaryService from './TaskSummaryService';
import UserService from './UserService';

// get colors from css variables ComputedStyle().getPropertyValue()
const colorMap = {
  danger: 'rgba(220, 53, 69, 0.6)', // '#e87a84',
  info: 'rgba(0, 123, 255, 0.6)', // '#57a8ff',
  success: 'rgba(40, 167, 69, 0.6)', // '#71c584',
  warning: '#f5d049',
  reject: '#e486af', // base #e83ecb
  // orange: '#feaa64',
};

const taskWord = (amount) => {
  switch (amount) {
    case 1: return 'задание';
    case 2:
    case 3:
    case 4: return 'задания';
    default: return 'заданий';
  }
};

export default {
  userStatuses: async (userId) => { // Состояние исполнения пользователя
    let totalAmount = 0; // 'Нет';

    const statuses = await TaskStatusService.list();

    const taskSummary = await TaskSummaryService.find({
      users: [userId],
    });

    const colors = [];
    const data = [];

    statuses
      .filter(status => taskSummary.find(item => item.statusId === status.id) !== undefined)
      .forEach((status) => {
        colors.push(colorMap[status.color]);
        const { amount } = taskSummary.find(item => item.statusId === status.id);
        data.push([status.name, amount]);
        totalAmount += amount;
      });

    return {
      chart: {
        height: '80%',
        spacingBottom: 0,
      },
      credits: {
        enabled: false,
      },
      title: {
        text: `<b>${totalAmount}</b><br>${taskWord(totalAmount)}`, // map 1 задание, 2-4 задания, заданий
        align: 'center',
        verticalAlign: 'middle',
        y: 20,
      },
      // tooltip: {
      //   pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      // },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: false,
            /* distance: -40,
            format: '{point.y}',
            style: {
              fontWeight: 'bold',
              color: 'white',
            }, */
          },
          startAngle: -90,
          endAngle: 90,
          center: ['50%', '65%'],
          size: '120%',
        },
      },
      colors,
      series: [{
        type: 'pie',
        name: '', // задания
        innerSize: '40%',
        data,
      }],
    };
  },

  personsStatuses: async () => { // Состояние исполнения по людям
    const result = await UserService.find({}); // query.depId, limit=
    const users = result.rows;

    const statuses = await TaskStatusService.list();

    const taskSummary = await TaskSummaryService.find({
      users: users.map(user => user.id),
    });

    const colors = [];
    const series = [];
    statuses.forEach((status) => {
      colors.push(colorMap[status.color]);
      const statusSummary = taskSummary.filter(item => item.statusId === status.id);
      // const data = statusSummary.map(rec => rec.amount);
      // выборку нужно упорядочить в соответствии со списком users
      // и дополнить нулями, если нет записей
      const data = users
        .map(user => statusSummary.find(rec => rec.userId === user.id))
        .map(rec => (rec ? rec.amount : 0));
      series.push({ name: status.name, data });
    });

    return {
      chart: {
        type: 'bar',
        // type: 'column',
      },
      plotOptions: {
        series: {
          stacking: 'normal',
        },
      },
      title: {
        text: 'Состояние исполнения заданий',
      },
      xAxis: {
        categories: users.map(user => user.fullName),
      },
      yAxis: {
        title: {
          text: 'Кол-во заданий',
        },
      },
      colors,
      series,
    };
  },
};
