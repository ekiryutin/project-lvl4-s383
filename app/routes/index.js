import welcome from './welcome';
import users from './users';
import jsonUsers from './api/users';
import sessions from './sessions';
import tasks from './tasks';
import jsonTasks from './api/tasks';
import attachments from './attachments';
import taskAttachments from './taskAttachments';
// import statuses from './statuses';
import jsonStatuses from './api/statuses';

const controllers = [
  welcome, sessions,
  users, jsonUsers,
  tasks, jsonTasks,
  attachments,
  taskAttachments,
  jsonStatuses,
];

export default (router, container) => controllers.forEach(f => f(router, container));
