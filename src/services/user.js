import CustomError from './error';

export default class UserServices {
  constructor({
    User, Entry, sequelize, Sequelize,
  }) {
    this.model = User;
    this.entryModel = Entry;
    this.sequelize = sequelize;
    this.Sequelize = Sequelize;
  }

  async create(arg) {
    return this.sequelize.transaction(async (t) => {
      const userExists = await this.model.findOne({
        where: {
          [this.Sequelize.Op.or]: [
            { email: arg.email }, { username: arg.username },
          ],
        },
        transaction: t,
      });
      if (userExists) throw new CustomError(406, 'User already exists with either email or username, please sign in');
      else {
        await this.model.create(arg, { transaction: t });
        const user = await this.model.findOne({
          where: {
            [this.Sequelize.Op.and]: [
              { email: arg.email }, { username: arg.username },
            ],
          },
          transaction: t,
          attributes: {
            exclude: ['password', 'updatedAt'],
          },
        });
        return { user, status: 201 };
      }
    });
  }

  async auth(arg) {
    return this.sequelize.transaction(async (t) => {
      const user = await this.model.findOne({
        where: {
          [this.Sequelize.Op.or]: [
            { email: arg.user }, { username: arg.user },
          ],
        },
        transaction: t,
      });
      if (user) {
        const verifyPassword = await this.model.compareString(user.password, arg.password);
        if (!verifyPassword) throw new CustomError(401, 'Password provided does not match user');
      } else throw new CustomError(404, 'User not found, please sign up by creating an account');
      return { user };
    });
  }

  async authJWT({ id }) {
    return this.sequelize.transaction(async (t) => {
      const user = await this.model.findByPk(id, {
        transaction: t,
        attributes: {
          exclude: ['password'],
        },
      });
      if (user === null) throw new CustomError(401, 'User not found, please sign up by creating an account');
      return user;
    });
  }

  async getUser(arg) {
    return this.sequelize.transaction(async (t) => this.model.findByPk(arg, {
      transaction: t,
      attributes: {
        exclude: ['password'],
      },
      include: { model: this.entryModel },
    }));
  }
}
