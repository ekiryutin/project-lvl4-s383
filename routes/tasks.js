import buildFormObj from '../lib/formObjectBuilder';
import Where from '../lib/Where';
import {
  Task, TaskStatus, User, // Sequelize,
} from '../models';

// const { Op } = Sequelize;
const pageSize = 10;

const makeWhere = (ctx) => {
  const where = new Where(ctx, Task);

  where.searchBy('statusId');
  where.searchBy('executorId');
  where.searchBy('authorId');
  // where.searchBy('tag', Op.in);
  console.log(where.get());

  return where.get();
};

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => { // список заданий
      const { query } = ctx.request;
      const currentPage = query.page || 1;

      const result = await Task.findAndCountAll({
        where: makeWhere(ctx),
        include: [
          { model: TaskStatus, as: 'status', attributes: ['id', 'name', 'color'] },
          { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] },
        ],
        order: ['dateTo'],
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
      });
      const tasks = result.rows;
      const recordCount = result.count;
      const pageCount = Math.ceil(recordCount / pageSize);
      const pages = {
        pageCount, pageSize, currentPage, recordCount,
      };
      ctx.render('tasks', { tasks, pages });
    })

    .get('newTask', '/tasks/new', (ctx) => { // добавление задания
      const task = Task.build();
      ctx.render('tasks/new', { f: buildFormObj(task, Task.attributes) });
    })

    .post('saveTask', '/tasks', async (ctx) => { // сохранение (нового) задания
      const { form } = ctx.request.body;
      const task = Task.build(form);
      try {
        await task.save();
        ctx.flash.set({ type: 'success', text: 'Задание успешно сохранено.' });
        ctx.redirect(router.url('showTask', task.id));
      } catch (err) {
        ctx.render('tasks/new', { f: buildFormObj(task, Task.attributes, err) });
      }
    })

    .get('showTask', '/tasks/:id', async (ctx) => { // просмотр задания
      const task = await Task.findByPk(ctx.params.id, {
        include: [
          { model: TaskStatus, as: 'status', attributes: ['id', 'name', 'color'] },
          { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] },
          { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
        ],
      });
      const access = {
        edit: ctx.state.auth.hasAccess('editTask', task.author.id),
        delete: ctx.state.auth.hasAccess('deleteTask', task.author.id),
      };
      console.log(JSON.stringify(task));
      ctx.render('tasks/show', { task, access });
    })

    .get('editTask', '/tasks/:id/edit', async (ctx) => { // редактирование задания
      const task = await Task.findByPk(ctx.params.id, {
        include: [
          { model: TaskStatus, as: 'status', attributes: ['id', 'name', 'color'] },
          { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] },
          { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
        ],
      });
      if (!ctx.state.auth.checkAccess(ctx, task.author.id)) {
        return;
      }
      ctx.render('tasks/edit', { f: buildFormObj(task, Task.attributes) });
    })

    .patch('updateTask', '/tasks/:id', async (ctx) => { // сохранение задания
      if (!ctx.state.auth.checkAccess(ctx, ctx.params.id)) {
        return;
      }
      const { form } = ctx.request.body;
      const task = await Task.findByPk(ctx.params.id);
      try {
        await task.update(form);
        // ctx.flash.set({ type: 'success', text: `Изменения успешно сохранены.` });
        ctx.redirect(router.url('showTask', task.id));
      } catch (err) {
        ctx.render('tasks/edit', { f: buildFormObj(task, Task.attributes, err) });
      }
    })

    .delete('deleteTask', '/tasks/:id', async (ctx) => { // удаление задания
      if (!ctx.state.auth.checkAccess(ctx, ctx.params.id)) {
        return;
      }
      const task = await Task.findByPk(ctx.params.id);
      await task.destroy();
      ctx.flash.set({ type: 'success', text: 'Задание успешно удалено.' });
      // logout ?
      ctx.redirect(router.url('tasks'));
    })

    .get('tasks.json', '/api/tasks.json', async (ctx) => { // список заданий
      const tasks = await Task.findAll({
        where: makeWhere(ctx),
        include: [
          { model: TaskStatus, as: 'status', attributes: ['id', 'name', 'color'] },
          { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] },
        ],
        order: ['dateTo'],
      });
      // const data = tasks.map(task => ({ id: task.id, name: task.fullName }));
      ctx.type = 'application/json';
      // ctx.body = JSON.stringify({ tasks: data });
      ctx.body = JSON.stringify({ tasks });
    });
};
