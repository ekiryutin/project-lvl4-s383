import _ from 'lodash';

export default (object, model, error = { errors: [] }) => ({
  name: 'form',
  object,
  model,
  errors: _.groupBy(error.errors, 'path'),
});
