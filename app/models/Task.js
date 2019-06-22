import dateFns from 'date-fns';
// import StateMachine from 'javascript-state-machine';

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
        const d = new Date(value);
        // use locale?
        return value !== null && dateFns.isValid(d) ? dateFns.format(d, 'dd.MM.yyyy') : value;
      },
      set(value) {
        // use locale?
        const d = dateFns.parse(value, 'dd.MM.yyyy', new Date());
        if (dateFns.isValid(d)) {
          this.setDataValue('dateTo', d);
        } else {
          this.setDataValue('dateTo', value === '' ? null : value);
        }
      },
      validate: {
        /* isDate: {
          msg: 'Неверная дата',
        }, */
        checkDate(value) { // вызывается после set
          if (typeof value === 'string' && value !== '') {
            throw new Error('Неверная дата');
          }
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
    authorName: { // *
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Введите автора',
        },
        isSelected(value) {
          if (value !== '' && this.authorId === '') {
            throw new Error('Выберите автора');
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
    executorName: { // *
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Введите исполнителя',
        },
        isSelected(value) {
          if (value !== '' && this.executorId === '') {
            throw new Error('Выберите исполнителя');
          }
        },
      },
    },
    tags: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.Tags ? this.Tags.map(tag => tag.name).join(', ') : '';
      },
      set(value) { // array of id
        if (this.Tags) {
          const cur = this.Tags.map(tag => tag.id);
          this.removeTags(cur);
        }
        this.setTags(value);
      },
    },
    attachAmount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // comments: {
  }, {
    paranoid: true, // использует `deletedAt, добавляет в запрос ...`deletedAt` IS NULL

    /* getterMethods: {
      nextStatus() {
          return null;
        }
      },
    }, */
  });
  Task.associate = (models) => {
    Task.belongsTo(models.TaskStatus, { as: 'status' });
    // Task.belongsTo(models.User, { as: 'author' });
    // Task.belongsTo(models.User, { as: 'executor' });
    Task.belongsToMany(models.Tag, { through: 'TaskTag' });
    Task.belongsToMany(models.Attachment, { through: 'TaskAttachment' });
  };
  // * добавление избыточных полей authorName и executorName
  // 1) упрощает и ускоряет запрос, т.к. не нужны join
  // 2) можно удалить fk (связь логическая)
  // 3)   позволит (при необходимости) легко сделать независимые (микро)сервисы tasks и users
  // 4)   в Users можно убрать paranoid и deletedAt
  return Task;
};
