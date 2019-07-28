import { TaskStatus, StatusTransition } from '../models';

let statuses = null;
let transitions = null;

const getTransitions = async () => {
  if (transitions === null) {
    transitions = await StatusTransition.findAll({ // cache
      attributes: ['fromId', 'toId', 'name', 'access', 'priority'], // чтобы не грузил id
      // order: ['primary'],
    });
  }
  return transitions;
};

export default {
  list: async () => { // список статусов
    if (statuses === null) {
      statuses = await TaskStatus.findAll({ // cache
        order: ['id'], // можно добавить отдельное поле для сортировки
      });
    }
    return statuses; // вернуть копию?
  },

  getStatusTransitions: async (fromId, userRoles = []) => { //  получить доступные действия
    await getTransitions();

    return transitions.filter(t => (t.fromId === Number(fromId) && userRoles.includes(t.access)));
    // .sort(t.order);
  },

  getTransition: async (fromId, toId) => {
    await getTransitions();

    return transitions.find(t => (t.fromId === Number(fromId) && t.toId === Number(toId)));
  },
};
