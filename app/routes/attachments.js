import path from 'path';
import formidable from 'koa2-formidable';
import { Attachment } from '../models';

const options = {
  type: 'multipart',
  uploadDir: path.join(__dirname, '..', '..', 'public', 'attachments'), // + yyyymm
  keepExtensions: true,
};

const getFileType = (mimetype) => {
  const mapper = [
    {
      check: mime => mime.startsWith('image/'),
      type: 'image',
    },
    {
      check: mime => mime === 'application/pdf',
      type: 'pdf',
    },
    {
      check: () => true, // default
      type: 'alt',
    },
  ];
  const { type } = mapper.find(({ check }) => check(mimetype));
  return type;
};

export default (router) => {
  router
    .post('saveAttachment', '/attachments', formidable(options), async (ctx) => {
      // ctx.state.auth.checkAccess(ctx, task ? task.authorId : 0);
      const { file } = ctx.request.files;
      // check size, format - on client
      // make preview / thumbnail - request to (micro) service
      const attachment = Attachment.build({
        fileName: path.basename(file.path),
        originalName: file.name,
        mimetype: file.type,
        type: getFileType(file.type),
        size: file.size,
        userId: ctx.state.userId(),
      });

      try {
        await attachment.save();
        ctx.type = 'application/json';
        ctx.body = JSON.stringify(attachment);
      } catch (err) {
        // console.log('-- error-- ', err.errors[0].message);
        ctx.body = JSON.stringify({ error: err.errors[0].message });
      }
    });
};
