
const isCurrentUser = (userId, id) => Number(id) === userId;

const isUser = userId => userId !== undefined;

export default {
  user: [
    { route: 'editUser', check: isCurrentUser },
    { route: 'updateUser', check: isCurrentUser },
    { route: 'deleteUser', check: isCurrentUser },

    { route: 'newTask', check: isUser },
    { route: 'saveTask', check: isUser },
    { route: 'editTask', check: isCurrentUser },
    { route: 'updateTask', check: isCurrentUser },
    { route: 'deleteTask', check: isCurrentUser },
  ],
  admin: [
    { route: 'editUser' },
    { route: 'updateUser' },
    { route: 'deleteUser' },
  ],
};
