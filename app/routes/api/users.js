import UserService from '../../services/UserService';

export default (router) => {
  router
    .get('users.json', '/api/users.json', async (ctx) => { // список пользователей
      const { query } = ctx.request;

      const result = await UserService.find(query);

      const users = result.rows;
      const data = users.map(user => ({ id: user.id, name: user.fullName }));
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({ users: data });
    });
};
