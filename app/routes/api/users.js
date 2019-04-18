import _ from 'lodash';
import { User, Sequelize } from '../../models';

const { Op } = Sequelize;

export default (router) => {
  router
    .get('users.json', '/api/users.json', async (ctx) => { // список пользователей
      const { query } = ctx.request;
      const name = _.upperFirst(_.lowerCase(query.name));
      const users = await User.findAll({
        // attributes: ['id', 'firstName', 'lastName'],
        where: {
          // firstName: { [Op.like]: `${name}%` },
          [Op.or]: [
            { firstName: { [Op.like]: `${name}%` } },
            { lastName: { [Op.like]: `${name}%` } },
          ],
        },
        order: ['lastName', 'firstName'],
      });
      const data = users.map(user => ({ id: user.id, name: user.fullName }));
      ctx.type = 'application/json';
      ctx.body = JSON.stringify({ users: data });
    });
};
