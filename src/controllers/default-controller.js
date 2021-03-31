import Sequelize from "sequelize";

const Op = Sequelize.Op;

export default class DefaultController {
  constructor(config) {
    this.model = config.model;
  }

  async showRecord(req, res) {
    return res.json(await this.showPureRecord(req));
  }

  async showPureRecord(req) {
    return await this.getModel().findByPk(req.params.id);
  }

  getModel() {
    return this.model;
  }

  async indexData(req) {
    const { page = 1, showActives = 1, usePagination = 1 } = req.query;
    const usePaginationFn = () => usePagination == 1;
    const limit = usePaginationFn() ? 10 : undefined;
    const offset = usePaginationFn() ? (page - 1) * limit : undefined;
    const { filters } = req.body;

    const where = {
      ativo: {
        [Op.gte]: showActives,
      },
    };

    for (const field in filters) {
      const filter = filters[field];
      let operation = Op.substring;
      let value = filter.value;

      if (filter.type == "BETWEEN") {
        operation = Op.between;
        value = [filter.values.start, filter.values.end];
      }

      where[field] = {
        [operation]: value,
      };
    }

    const list = await this.getModel().findAndCountAll({
      limit,
      offset,
      where,
    });
    const total = list.count;
    const pages = usePaginationFn() ? Math.ceil(total / limit) : 1;

    return {
      data: list.rows,
      total,
      limit,
      page: Number(page),
      pages,
    };
  }

  async index(req, res) {
    return res.json(await this.indexData(req));
  }

  async save(req, res) {
    const createdRecord = await this.getModel().create(req.body);
    return res.json(createdRecord);
  }

  async show(req, res) {
    return await this.showRecord(req, res);
  }

  async update(req, res) {
    await this.getModel().update(req.body, {
      where: {
        id: {
          [Op.eq]: req.params.id,
        },
      },
    });
    return await this.showRecord(req, res);
  }

  async destroy(req, res) {
    req.body.ativo = 0;
    return this.update(req, res);
  }
}
