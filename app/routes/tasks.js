// import util from 'util';
import debug from 'debug';
import buildFormObj from '../lib/formObjectBuilder';
import pagination from '../lib/pagination';
import referer from '../lib/referer';
import { getParamUrl } from '../lib/utils';
import renderAndSend from '../lib/chunkRender';

import TaskService from '../services/TaskService';
import {
  Task, TaskStatus, Tag, Attachment,
} from '../models';

const pageSize = 10; // config

const queryInclude = [
  { model: TaskStatus, as: 'status', attributes: ['id', 'name', 'color'] },
  // { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] },
  // { model: User, as: 'author', attributes: ['id', 'firstName', 'lastName'] },
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

      const result = await TaskService.find(query);
      log('sql query');

      ctx.render('tasks', {
        tasks: result.rows,
        pages: pagination(result.count, pageSize, currentPage),
        f: buildFormObj(query, null), // for filter
        // statuses: [{ id: '', name: '' }, ...statuses], // append empty status
        statuses,
        access,
        paramUrl: getParamUrl(ctx), // для формирования ссылок
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
        statuses,
        access,
      });
      log('render filter');

      const result = await TaskService.find(query);
      log('sql query');

      renderAndSend(ctx, 'tasks/list_table', {
        tasks: result.rows,
        pages: pagination(result.count, pageSize, currentPage),
        access,
        paramUrl: getParamUrl(ctx), // для формирования ссылок
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
      const attributes = {
        ...form,
        authorId: ctx.state.userId(),
        authorName: ctx.state.userName(),
      };
      const { task, error } = await TaskService.createTask(attributes);

      if (error === null) {
        ctx.flash.set({ type: 'success', text: 'Задание успешно сохранено.' });
        referer.prevent(ctx);
        ctx.redirect(router.url('showTask', task.id));
      } else {
        const statuses = await TaskStatus.findAll();
        ctx.render('tasks/new', {
          f: buildFormObj(task, Task.attributes, error),
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
      {
        const task = await Task.findByPk(ctx.params.id);
        ctx.state.auth.checkAccess(ctx, task ? task.authorId : 0);
      }
      const form = ctx.request.body;
      const { task, error } = await TaskService.updateTask(ctx.params.id, form);

      if (error === null) {
        // ctx.flash.set({ type: 'success', text: `Изменения успешно сохранены.` });
        referer.prevent(ctx);
        ctx.redirect(router.url('showTask', task.id));
      } else {
        const statuses = await TaskStatus.findAll();
        // referer.prevent(ctx); ?
        ctx.render('tasks/edit', {
          f: buildFormObj(task, Task.attributes, error),
          statuses,
        });
      }
    })

    .patch('statusTask', '/tasks/:id/status', async (ctx) => { // изменение статуса
      {
        const task = await Task.findByPk(ctx.params.id);
        ctx.state.auth.checkAccess(ctx, task ? task.executorId : 0);
      }
      const form = ctx.request.body;
      const { task, error } = await TaskService.setTaskStatus(ctx.params.id, form);

      if (error !== null) {
        ctx.flash.set({ type: 'error', text: error });
      }
      referer.prevent(ctx);
      ctx.redirect(router.url('showTask', task.id));
    })

    .delete('deleteTask', '/tasks/:id', async (ctx) => { // удаление задания
      {
        const task = await Task.findByPk(ctx.params.id);
        ctx.state.auth.checkAccess(ctx, task ? task.authorId : 0);
      }

      const error = await TaskService.deleteTask(ctx.params.id);

      if (error === null) {
        ctx.flash.set({ type: 'success', text: 'Задание успешно удалено.' });
      } else {
        ctx.flash.set({ type: 'error', text: error });
      }
      referer.prevent(ctx);
      ctx.redirect(ctx.state.referFor()); // возврат обратно
    });
};
