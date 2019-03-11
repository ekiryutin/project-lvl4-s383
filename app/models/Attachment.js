const attachmentUrl = '/attachments';

export default (sequelize, DataTypes) => {
  const Attachment = sequelize.define('Attachment', {
    fileName: {
      type: DataTypes.STRING,
    },
    originalName: {
      type: DataTypes.STRING,
    },
    mimetype: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    size: {
      type: DataTypes.INTEGER,
      get() {
        const value = Math.round(Number(this.getDataValue('size')) / 1024);
        return `${value} КБ`;
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userName: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.user ? this.user.fullName : 'not included';
      },
    },
    fileUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${attachmentUrl}/${this.fileName}`;
      },
    },
  }, {
    paranoid: false,

    /* getterMethods: {
      formattedTime() {
        const date = new Date(this.createdAt);
        return date !== null && dateFns.isValid(date)
          ? dateFns.format(date, 'dd.MM.yyyy hh24:mi') : '';
      },
    }, */
  });
  return Attachment;
};
