import CustomError from './error';

export default class EntityServices {
  constructor({ Entry, sequelize, Sequelize }) {
    this.model = Entry;
    this.sequelize = sequelize;
    this.Sequelize = Sequelize;
  }

  async create({ title, body, UserId }) {
    return this.sequelize.transaction(async (t) => {
      const entry = await this.model.create({
        title,
        body,
        UserId,
      }, {
        transaction: t,
      });
      return { entry, status: 201 };
    });
  }

  async findByOwner(UserId) {
    return this.sequelize.transaction(async (t) => {
      const entries = await this.model.findAll({
        where: {
          UserId,
        },
        transaction: t,
      });
      return { entries };
    });
  }

  async findOneByOwner({ UserId, id }) {
    return this.sequelize.transaction(async (t) => {
      const entry = await this.model.findOne({
        where: {
          [this.Sequelize.Op.and]: [
            { UserId }, { id },
          ],
        },
        transaction: t,
      });
      if (entry === null) throw new CustomError(404, 'Entry not found');
      return { entry };
    });
  }

  async updateOne({
    title, body, UserId, id,
  }) {
    return this.sequelize.transaction(async (t) => {
      await this.model.update({ title, body }, {
        where: {
          [this.Sequelize.Op.and]: [
            { UserId }, { id },
          ],
        },
        transaction: t,
      });
      const entry = await this.model.findOne({
        where: {
          [this.Sequelize.Op.and]: [
            { UserId }, { id },
          ],
        },
        transaction: t,
      });
      return { entry };
    });
  }
}
