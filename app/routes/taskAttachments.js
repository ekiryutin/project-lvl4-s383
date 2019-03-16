import referer from '../lib/referer';
import {
  Task, Attachment, TaskAttachment,
} from '../models';

export default (router) => {
  router
    .post('saveTaskAttachment', '/tasks/:id/attachment', async (ctx) => { // прикрепление файла
      const task = await Task.findByPk(ctx.params.id);
      ctx.state.auth.checkAccess(ctx, task ? [task.authorId, task.executorId] : 0);

      const form = {
        TaskId: ctx.params.id,
        AttachmentId: ctx.request.body.AttachmentId,
      };
      const taskAttach = TaskAttachment.build(form);
      ctx.type = 'application/json';
      try {
        await taskAttach.save();
        // Task.attachAmount increased in trigger
        ctx.body = JSON.stringify({ type: 'success', text: 'Файл успешно прикреплен.' });
      } catch (err) {
        // console.log(' TaskAttachments.error: ', JSON.stringify(err));
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
      // файл не удаляется
      await taskAttachment.destroy();
      // Task.attachAmount decreased in trigger
      ctx.flash.set({ type: 'success', text: 'Файл успешно удален.' });
      referer.prevent(ctx);
      ctx.redirect(router.url('showTask', ctx.params.taskId));
    });
};
