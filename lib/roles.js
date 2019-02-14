
const isCurrentUser = (userId, id) => Number(id) === userId;

export default {
  user: [
    { route: 'editUser', check: isCurrentUser },
    { route: 'updateUser', check: isCurrentUser },
    { route: 'deleteUser', check: isCurrentUser },
  ],
  admin: [
    { route: 'editUser' },
    { route: 'updateUser' },
    { route: 'deleteUser' },
  ],
};
