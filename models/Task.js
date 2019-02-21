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
      validate: {
        isDate: {
          msg: 'Неверный формат даты (дд.мм.гггг)',
        },
      },
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { table: 'Users', field: 'id' },
      validate: {
        notEmpty: {
          msg: 'Обязательное поле',
        },
      },
    },
    authorName: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Введите автора',
        },
        isSelected(value) {
          if (value !== null && this.authorId === null) {
            throw new Error('Выберите автора');
          }
        },
      },
    },
    executorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    executorName: {
      type: DataTypes.VIRTUAL,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Введите исполнителя',
        },
        isSelected(value) {
          if (value !== null && this.executorId === null) {
            throw new Error('Выберите исполнителя');
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
    getterMethods: {
      formattedDateTo() {
        const date = new Date(this.dateTo);
        return this.dateTo ? dateFns.format(date, 'DD.MM.YYYY') : null;
      },
    },
  });
  Task.associate = (models) => {
    Task.belongsTo(models.TaskStatus, { as: 'status' });
    Task.belongsTo(models.User, { as: 'author' });
    Task.belongsTo(models.User, { as: 'executor' });
  };
  return Task;
};
