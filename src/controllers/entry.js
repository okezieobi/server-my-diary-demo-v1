export default class EntryController {
  constructor(services) {
    this.services = services.entry;
    this.createOne = this.createOne.bind(this);
    this.findAll = this.findAll.bind(this);
  }

  async createOne({ body: { title, body } }, res, next) {
    try {
      const data = await this.services.create({ title, body, id: res.locals.id });
      if (data.message) next(data);
      else {
        res.locals.data = data;
        next();
      }
    } catch (err) {
      next(err);
    }
  }

  async findAll(req, res, next) {
    try {
      const data = await this.services.findByOwner(res.locals.id);
      res.locals.data = data;
      next();
    } catch (err) {
      next(err);
    }
  }
}
