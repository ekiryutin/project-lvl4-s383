import { Op, DataTypes } from 'sequelize';

export default class {
  constructor(ctx, model) {
    this.query = ctx.request.query;
    this.model = model;
    this.where = {};
  }

  searchBy(param, operator = Op.eq) {
    let value = this.query[param];
    const { type } = this.model.attributes[param];
    if (value === undefined || value === '') {
      return;
    }
    if (type instanceof DataTypes.INTEGER && !Number.isNaN(Number(value))) {
      // проверить postgres explain analyze
      // используется ли индекс при сравнении id со строкой
      value = Number(value);
    }
    this.where[param] = { [operator]: value };
  }

  get() {
    return this.where;
  }
}
