import _ from 'lodash';
import { Op } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    timestamps: false,
  });
  Tag.associate = (models) => {
    Tag.belongsToMany(models.Task, { through: 'TaskTag' });
  };

  Tag.findByNames = async (value = '') => { // параметр - строка с тегами через запятую
    const names = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (names.length === 0) return [];
    // поиск новых тегов
    const hasTags = await Tag.findAll({
      where: { name: { [Op.in]: names } },
    });
    // новые теги, которых нет в таблице
    const newNames = _.difference(names, hasTags.map(tag => tag.name));
    // добавление новых тегов
    const newTags = await Promise.all(newNames.map(name => Tag.build({ name }).save()));

    const tags = hasTags.concat(newTags);
    return tags.map(tag => tag.id);
  };

  return Tag;
};
