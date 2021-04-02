import Sequelize from "sequelize";
import db from "../models";

const Op = Sequelize.Op;

export default class DefaultController {
  constructor(config) {
    this.model = config.model;
  }

  async showRecord(request, response) {
    return response.json(await this.showPureRecord(request));
  }

  async showPureRecord(request) {
    return await this.getModel().findByPk(request.params.id);
  }

  getModel() {
    return this.model;
  }

  async indexData(request, customInclude = {}) {
    const {
      page = 1,
      showActives = 1,
      usePagination = 1,
      rowsPerPage = 10,
    } = request.query;

    const usePaginationFn = () => usePagination == 1;
    const limit = usePaginationFn() ? Number(rowsPerPage) : undefined;
    const offset = usePaginationFn() ? (page - 1) * limit : undefined;
    const { filters } = request.body;

    const where = {
      active: {
        [Op.gte]: showActives,
      },
    };

    const include = [...customInclude];

    for (const field in filters) {
      const filter = filters[field];
      let operation = Op.substring;
      let value = filter.value;

      switch (filter.type) {
        case "BETWEEN":
          operation = Op.between;
          value = [filter.values.start, filter.values.end];
          break;
        case "IN": {
          operation = Op.in;
          value = filter.values;
        }
      }

      if (field.includes(".")) {
        const [tableName, fieldName] = field.split(".");
        const whereToFilter = {};
        whereToFilter[fieldName] = {
          [operation]: value,
        };

        const tableToFilter = {
          model: db.experience,
          as: tableName,
          attributes: ["id", fieldName],
          where: whereToFilter,
        };

        include.push(tableToFilter);
      } else {
        where[field] = {
          [operation]: value,
        };
      }
    }

    const list = await this.getModel().findAndCountAll({
      limit,
      offset,
      where,
      include,
    });
    const total = list.count;
    const pages = usePaginationFn() ? Math.ceil(total / limit) : 1;

    return {
      data: list.rows,
      total,
      offset,
      limit,
      page: Number(page),
      pages,
    };
  }

  async index(request, response) {
    return response.json(await this.indexData(request));
  }

  async save(request, response) {
    const createdRecord = await this.getModel().create(request.body);
    return response.json(createdRecord);
  }

  async show(request, response) {
    return await this.showRecord(request, response);
  }

  async update(request, response) {
    await this.getModel().update(request.body, {
      where: {
        id: {
          [Op.eq]: request.params.id,
        },
      },
    });
    return await this.showRecord(request, response);
  }

  async destroy(request, response) {
    request.body.active = 0;
    return this.update(request, response);
  }
}
