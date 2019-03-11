import roles from './roles';

export default class {
  constructor(userId) {
    this.userId = userId;
    this.userRole = userId !== undefined ? 'user' : null; // tmp
    this.services = this.loadServices();
  }

  loadServices() {
    // доступные сервисы можно загрузить из кеша по this.userId
    if (this.userRole) {
      return roles[this.userRole];
    }
    return [];
  }

  // проверка доступа к текущему сервису (вызывает сам сервис)
  checkAccess(ctx, id) {
    const service = this.services.find(item => item.route === ctx._matchedRouteName); // eslint-disable-line
    if (service === undefined) {
      // console.log(`checkAccess: '${ctx._matchedRouteName}' not found`);
      ctx.throw(403); // Forbidden
    }
    if (service.check === undefined) {
      return true;
    }
    const result = service.check(this.userId, id);
    if (result === false) {
      ctx.throw(403); // Forbidden
    }
    return true;
  }

  // проверка доступа к сервису
  hasAccess(routeName, id) {
    const service = this.services.find(item => item.route === routeName);
    if (service === undefined) {
      return false;
    }
    if (service.check === undefined) {
      return true;
    }
    return service.check(this.userId, id);
  }
}
