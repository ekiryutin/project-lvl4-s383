import dateFns from 'date-fns';

export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Обязательное поле',
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        notEmpty: {
          msg: 'Выберите статус',
        },
      },
    },
    dateTo: {
      type: DataTypes.DATE,
      get() {
        const value = this.getDataValue('dateTo');
        const date = new Date(value);
        return value ? dateFns.format(date, 'DD.MM.YYYY') : '';
      },
      validate: {
        isDate: {
          msg: 'Неверный формат дд.мм.гггг',
        },
      },
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Введите автора',
        },
      },
    },
    authorName: {
      type: DataTypes.VIRTUAL,
      get() {
        const value = this.getDataValue('authorName');
        return this.author ? this.author.fullName : value;
      },
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Введите автора',
        },
        isSelected(value) {
          if (value !== '' && this.authorId === '') {
            throw new Error('Нужно выбрать из списка');
          }
        },
      },
    },
    executorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Введите исполнителя',
        },
      },
    },
    executorName: {
      type: DataTypes.VIRTUAL,
      get() {
        const value = this.getDataValue('executorName');
        return this.executor ? this.executor.fullName : value;
      },
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Введите исполнителя',
        },
        isSelected(value) {
          if (value !== '' && this.executorId === '') {
            throw new Error('Нужно выбрать из списка');
          }
        },
      },
    },
    tags: {
      type: DataTypes.VIRTUAL,
    },
    // attachments: {
    // comments: {
  }, {
  });
  Task.associate = (models) => {
    Task.belongsTo(models.TaskStatus, { as: 'status' });
    Task.belongsTo(models.User, { as: 'author' });
    Task.belongsTo(models.User, { as: 'executor' });
  };
  return Task;
};
