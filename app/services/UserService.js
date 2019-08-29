import { User, Sequelize } from '../models';

const { Op } = Sequelize;
const pageSize = 10; // config

const makeWhere = (query) => {
  const where = {};
  if (query.name) {
    const name = query.name.toLowerCase();
    where[Op.or] = [
      // { Sequelize.where( Sequelize.fn('lower', Sequelize.col('firstName')), `${name}%` ) },
      Sequelize.literal(`lower("firstName") like '${name}%'`),
      Sequelize.literal(`lower("lastName") like '${name}%'`),
      // в базе нужны индексы по lower("firstName") и lower("lastName")
    ];
  }
  return where;
};

export default {
  find: async (query) => { // поиск (список) пользователей
    const currentPage = query.page || 1;

    // const users = await User.findAll({
    const result = await User.findAndCountAll({
      order: ['lastName', 'firstName'], // index
      where: makeWhere(query),
      offset: (currentPage - 1) * pageSize,
      limit: pageSize,
    });
    // const users = result.rows;
    return result;
  },

  createUser: async (form) => { // сохранение (нового) пользователя
    const user = User.build(form);
    try {
      await user.save();
      return { user, error: null };
    } catch (error) {
      return { user, error };
    }
  },

  updateUser: async (id, form) => { // сохранение пользователя
    const user = await User.findByPk(id);
    try {
      await user.update(form);
      return { user, error: null };
    } catch (error) {
      return { user, error };
    }
  },

  deleteUser: async (id) => { // удаление пользователя
    const user = await User.findByPk(id);
    try {
      // перенести пользователя в user_archive ?
      await user.destroy();
      return null;
    } catch (error) {
      return error;
    }
  },
};
