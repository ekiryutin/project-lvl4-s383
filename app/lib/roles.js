
const isCurrentUser = (userId, id) => Number(id) === userId;

const isUser = userId => userId !== undefined;

export default {
  user: [
    { route: 'editUser', check: isCurrentUser }, // user
    { route: 'updateUser', check: isCurrentUser }, // user
    { route: 'deleteUser', check: isCurrentUser }, // user

    { route: 'newTask', check: isUser },
    { route: 'saveTask', check: isUser },
    { route: 'editTask', check: isCurrentUser }, // author
    { route: 'updateTask', check: isCurrentUser }, // author
    { route: 'deleteTask', check: isCurrentUser }, // author
    { route: 'statusTask', check: isCurrentUser }, // executor

    { route: 'saveStatus', check: isUser },
  ],
  admin: [
    { route: 'editUser' },
    { route: 'updateUser' },
    { route: 'deleteUser' },
  ],
};
