import { Op, DataTypes } from 'sequelize';

export default class {
  constructor(query, model) {
    this.query = query;
    this.model = model;
    this.where = {};
  }

  searchBy(param, operator = Op.eq) {
    let value = this.query[param];
    if (value === undefined || value === '') {
      return;
    }
    const { type } = this.model.rawAttributes[param];
    if (type instanceof DataTypes.INTEGER && !Number.isNaN(Number(value))) {
      // проверить postgres explain analyze
      // используется ли индекс при сравнении id со строкой
      value = Number(value);
    }
    if (typeof operator !== 'function') {
      this.where[param] = { [operator]: value }; // здесь operator - условие типа Op.eq, Op.in
    } else {
      const oper = operator(value); // функция, которая формирует условие (например, для 'tags')
      this.where[oper.param] = oper.condition;
    }
  }

  get() {
    return this.where;
  }
}
