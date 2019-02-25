import dateFns from 'date-fns';
import { encrypt } from '../lib/secure';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          msg: 'Введите имя',
        },
      },
    },
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: {
        msg: 'Пользователь с таким e-mail уже есть',
      },
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Введите e-mail',
        },
        isEmail: {
          msg: 'Неверный формат e-mail',
        },
      },
    },
    passwordDigest: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.VIRTUAL,
      set(value) {
        this.setDataValue('passwordDigest', encrypt(value));
        this.setDataValue('password', value);
        return value;
      },
      validate: {
        notEmpty: {
          msg: 'Введите пароль',
        },
        len: {
          args: [3, +Infinity],
          msg: 'Пароль должен быть не менее 3 символов',
        },
      },
    },
  }, {
    paranoid: true, // использует `deletedAt,-добавляет в запрос ...`deletedAt` IS NULL

    getterMethods: {
      fullName() {
        return `${this.lastName} ${this.firstName}`;
      },
      formattedDate() {
        const date = new Date(this.createdAt);
        return date !== null && dateFns.isValid(date) ? dateFns.format(date, 'dd.MM.yyyy') : '';
      },
    },
  });
  return User;
};
