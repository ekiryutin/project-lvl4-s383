import { makeWhere } from '../lib/utils';
import {
  Task, TaskStatus, Tag, Sequelize,
} from '../models';

const { Op } = Sequelize;
const pageSize = 10; // config

const searchConditions = [
  {
    param: 'statusId',
    condition: value => ({ [Op.eq]: Number(value) }), // { [Op.in]: [53] },
  },
  {
    param: 'executorId',
    condition: value => ({ [Op.eq]: Number(value) }),
  },
  {
    param: 'authorId',
    condition: value => ({ [Op.eq]: Number(value) }),
  },
  {
    param: 'tags',
    field: '$Task.id$',
    condition: (value) => {
      const tags = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const strTags = tags.map(s => `'${s}'`).join(',');
      const subquery = `(select "TaskId" from "TaskTags" join "Tags" on "Tags"."id" = "TagId" where "Tags"."name" in (${strTags}))`;
      return { [Op.in]: Sequelize.literal(subquery) };
    },
  },
];

const queryInclude = [
  { model: TaskStatus, as: 'status', attributes: ['id', 'name', 'color'] },
  // { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] },
  // { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
  { model: Tag },
];

// про Entities & Domain Services
// https://habr.com/ru/company/mobileup/blog/335382/

export default {
  find: async (query) => { // поиск (список) заданий
    const currentPage = query.page || 1;

    const result = await Task.findAndCountAll({
      include: queryInclude,
      where: makeWhere(query, searchConditions),
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

  // для изменения статуса сделать отдельные функции: takeTaskInWork, completeTask
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
