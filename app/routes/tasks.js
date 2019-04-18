// import util from 'util';
import debug from 'debug';
import buildFormObj from '../lib/formObjectBuilder';
import Where from '../lib/Where';
import pagination from '../lib/pagination';
import referer from '../lib/referer';
import renderAndSend from '../lib/chunkRender';
import {
  Task, TaskStatus, Tag, Attachment, User, Sequelize,
} from '../models';

const { Op } = Sequelize;
export const pageSize = 10;

export const makeWhere = (query) => {
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

export const queryInclude = [
  { model: TaskStatus, as: 'status', attributes: ['id', 'name', 'color'] },
  { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] },
  { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
  { model: Tag },
];

const log = debug('application:tasks');
// const timeout = util.promisify(setTimeout);

export default (router) => {
  router
    .get('tasks', '/tasks', async (ctx) => { // список заданий
      log('GET');
      const { query } = ctx.request;
      const currentPage = query.page || 1;
      const statuses = await TaskStatus.findAll();
      const access = {
        new: ctx.state.auth.hasAccess('newTask'),
      };
      log('init');

      const result = await Task.findAndCountAll({
        include: queryInclude,
        where: makeWhere(query),
        subQuery: false,
        order: ['dateTo'],
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
      });
      log('sql query');

      ctx.render('tasks', {
        tasks: result.rows,
        pages: pagination(ctx, result.count, pageSize, currentPage),
        f: buildFormObj(query, null), // for filter
        statuses: [{ id: '', name: '' }, ...statuses], // append empty status
        access,
      });
      log('render');
    })

    .get('listTasks', '/tasks/list', async (ctx) => { // список заданий
      // здесь тот же список рендерится не одним файлом, а частями (chunks)
      log('GET');
      const { query } = ctx.request;
      const currentPage = query.page || 1;
      const statuses = await TaskStatus.findAll();
      const access = {
        new: ctx.state.auth.hasAccess('newTask'),
      };
      log('init');

      renderAndSend(ctx, 'tasks/list_header', {
        access,
      });
      log('render header');
      // await timeout(10, 'delay');

      renderAndSend(ctx, 'tasks/list_filter', {
        f: buildFormObj(query, null), // for filter
        statuses: [{ id: '', name: '' }, ...statuses], // append empty status
        access,
      });
      log('render filter');

      const result = await Task.findAndCountAll({
        include: queryInclude,
        where: makeWhere(query),
        subQuery: false,
        order: ['dateTo'],
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
      });
      log('sql query');

      renderAndSend(ctx, 'tasks/list_table', {
        tasks: result.rows,
        pages: pagination(ctx, result.count, pageSize, currentPage),
        access,
      });
      log('render table');

      renderAndSend(ctx, 'layouts/footer');
      ctx.res.end();
    })

    .get('newTask', '/tasks/new', async (ctx) => { // форма добавления задания
      // ctx.state.auth.checkAccess(ctx); { // проверка не работает, т.к. matchedRoute = showTask
      //                                    // некритично - сработает проверка в saveTask

      const statuses = await TaskStatus.findAll();
      const task = Task.build();
      referer.saveFor(ctx, ['showTask', 'newTask']); // чтобы после сохранения вернуться из просмотра и для Cancel

      ctx.render('tasks/new', {
        f: buildFormObj(task, Task.attributes),
        statuses,
      });
    })

    .post('saveTask', '/tasks', async (ctx) => { // сохранение (нового) задания
      ctx.state.auth.checkAccess(ctx);

      const form = ctx.request.body;
      const tags = await Tag.findByNames(form.tags);
      // console.log('---- form after:', JSON.stringify({ ...form, tags }));

      const task = Task.build({ ...form, tags });
      task.set('authorId', ctx.state.userId());
      task.set('authorName', ctx.state.userName());

      try {
        await task.save();
        ctx.flash.set({ type: 'success', text: 'Задание успешно сохранено.' });
        referer.prevent(ctx);
        ctx.redirect(router.url('showTask', task.id));
      } catch (err) {
        const statuses = await TaskStatus.findAll();
        ctx.render('tasks/new', {
          f: buildFormObj(task, Task.attributes, err),
          statuses,
        });
      }
    })

    .get('showTask', '/tasks/:id', async (ctx) => { // форма просмотра задания
      const task = await Task.findByPk(ctx.params.id, {
        include: [
          ...queryInclude,
          { model: Attachment },
        ],
      });
      const access = {
        edit: ctx.state.auth.hasAccess('editTask', task.authorId),
        delete: ctx.state.auth.hasAccess('deleteTask', task.authorId),
        status: ctx.state.auth.hasAccess('statusTask', task.executorId) && task.nextStatus !== null,
        attach: ctx.state.auth.hasAccess('saveTaskAttachment', [task.authorId, task.executorId]),
      };
      referer.saveFor(ctx, ['showTask', 'deleteTask']);
      ctx.render('tasks/show', { task, access });
    })

    .get('editTask', '/tasks/:id/edit', async (ctx) => { // форма редактирования задания
      const task = await Task.findByPk(ctx.params.id, {
        include: queryInclude,
      });
      ctx.state.auth.checkAccess(ctx, task ? task.authorId : 0);

      const statuses = await TaskStatus.findAll();
      referer.saveFor(ctx, ['editTask', 'updateTask']); // для Cancel

      ctx.render('tasks/edit', {
        f: buildFormObj(task, Task.attributes),
        statuses,
      });
    })

    .patch('updateTask', '/tasks/:id', async (ctx) => { // сохранение задания
      const form = ctx.request.body;
      const task = await Task.findByPk(ctx.params.id, {
        include: { model: Tag }, // информация о тегах, если их надо будет удалить
      });
      ctx.state.auth.checkAccess(ctx, task ? task.authorId : 0);

      const tags = await Tag.findByNames(form.tags);
      try {
        await task.update({ ...form, tags });
        // ctx.flash.set({ type: 'success', text: `Изменения успешно сохранены.` });
        referer.prevent(ctx);
        ctx.redirect(router.url('showTask', task.id));
      } catch (err) {
        const statuses = await TaskStatus.findAll();
        // referer.prevent(ctx); ?
        ctx.render('tasks/edit', {
          f: buildFormObj(task, Task.attributes, err),
          statuses,
        });
      }
    })

    .patch('statusTask', '/tasks/:id/status', async (ctx) => { // изменение статуса
      const form = ctx.request.body;
      const task = await Task.findByPk(ctx.params.id);
      ctx.state.auth.checkAccess(ctx, task ? task.executorId : 0);

      try {
        await task.update(form);
      } catch (err) {
        ctx.flash.set({ type: 'error', text: err });
      }
      referer.prevent(ctx);
      ctx.redirect(router.url('showTask', task.id));
    })

    .delete('deleteTask', '/tasks/:id', async (ctx) => { // удаление задания
      const task = await Task.findByPk(ctx.params.id);
      ctx.state.auth.checkAccess(ctx, task ? task.authorId : 0);

      await task.destroy();
      ctx.flash.set({ type: 'success', text: 'Задание успешно удалено.' });
      referer.prevent(ctx);
      ctx.redirect(ctx.state.referFor()); // возврат обратно
    });
};
