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
      // references: { table: 'TaskStatuses', field: 'id' },
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
    executorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      // references: { table: 'Users', field: 'id' },
      validate: {
        notEmpty: {
          msg: 'Выберите исполнителя',
        },
      },
    },
    // tags: {
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
