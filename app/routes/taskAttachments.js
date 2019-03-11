import referer from '../lib/referer';
import {
  Task, Attachment, TaskAttachment,
} from '../models';

export default (router) => {
  router
    .post('saveTaskAttachment', '/tasks/:id/attachment', async (ctx) => { // прикрепление файла
      const task = await Task.findByPk(ctx.params.id);
      ctx.state.auth.checkAccess(ctx, task ? [task.authorId, task.executorId] : 0);

      // const attachment = ctx.state.flash.get();
      const form = {
        TaskId: ctx.params.id,
        AttachmentId: ctx.request.body.AttachmentId,
      };
      const taskAttach = TaskAttachment.build(form);
      ctx.type = 'application/json';
      try {
        await taskAttach.save();
        ctx.body = JSON.stringify({ type: 'success', text: 'Файл успешно прикреплен.' });
      } catch (err) {
        // console.log('-- TA.error-- ', err);
        ctx.body = JSON.stringify({ type: 'error', text: err.errors[0].message });
      }
    })

    .delete('deleteTaskAttachment', '/tasks/:taskId/attachment/:attachId', async (ctx) => {
      const attachment = await Attachment.findByPk(ctx.params.attachId);
      ctx.state.auth.checkAccess(ctx, attachment ? attachment.userId : 0);

      const taskAttachment = await TaskAttachment.findOne({
        where: {
          TaskId: ctx.params.taskId,
          AttachmentId: ctx.params.attachId,
        },
      });
      // запись в Attachments пометить удаленной
      // удалить файл
      await taskAttachment.destroy();
      ctx.flash.set({ type: 'success', text: 'Файл успешно удален.' });
      referer.prevent(ctx);
      ctx.redirect(router.url('showTask', ctx.params.taskId));
    });
};
