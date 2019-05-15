import Where from '../lib/Where';
import {
  Task, TaskStatus, Tag, Sequelize,
} from '../models';

const { Op } = Sequelize;
const pageSize = 10; // config

const makeWhere = (query) => {
  const where = new Where(query, Task);

  where.searchBy('statusId');
  where.searchBy('executorId');
  where.searchBy('authorId');
  where.searchBy('tags', (value) => {
    const tags = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    return {
      param: '$Tags.name$',
      // condition: { [Op.in]: [value] },
      condition: { [Op.in]: tags }, // Op.or
    };
  });
  return where.get();
};

const queryInclude = [
  { model: TaskStatus, as: 'status', attributes: ['id', 'name', 'color'] },
  // { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] },
  // { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
  { model: Tag },
];

export default {
  find: async (query) => { // поиск (список) заданий
    const currentPage = query.page || 1;

    const result = await Task.findAndCountAll({
      include: queryInclude,
      where: makeWhere(query),
      subQuery: false,
      order: ['dateTo'],
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
    });
    return result;
  },

  createTask: async (form) => { // сохранение (нового) задания
    const tags = await Tag.findByNames(form.tags);
    const task = Task.build({ ...form, tags });
    try {
      await task.save();
      return { task, error: null };
    } catch (error) {
      return { task, error };
    }
  },

  updateTask: async (id, form) => { // сохранение задания
    const task = await Task.findByPk(id, {
      include: { model: Tag }, // информация о тегах, если их надо будет удалить
    });
    const tags = await Tag.findByNames(form.tags);
    try {
      await task.update({ ...form, tags });
      return { task, error: null };
    } catch (error) {
      return { task, error };
    }
  },

  setTaskStatus: async (id, form) => { // изменение статуса
    // const form = ctx.request.body;
    const task = await Task.findByPk(id);
    // ctx.state.auth.checkAccess(ctx, task ? task.executorId : 0);

    try {
      await task.update(form);
      return { task, error: null };
    } catch (error) {
      return { task, error };
    }
  },

  deleteTask: async (id) => { // удаление задания
    const task = await Task.findByPk(id);
    // ctx.state.auth.checkAccess(ctx, task ? task.authorId : 0);

    try {
      await task.destroy();
      return null;
    } catch (error) {
      return error;
    }
  },
};
