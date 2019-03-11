module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Attachments', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    fileName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    originalName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    mimetype: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    size: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    deletedAt: {
      type: Sequelize.DATE,
    },
  })
    .then(() => queryInterface.addIndex('Attachments', ['id']))
    .then(() => queryInterface.addConstraint('Attachments', ['userId'], {
      type: 'foreign key',
      references: { table: 'Users', field: 'id' },
    })),

  down: queryInterface => queryInterface.dropTable('Attachments'),
};
