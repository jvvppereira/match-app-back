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

  async indexData(request, customWhere = {}) {
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
      ...customWhere
    };

    const include = [];

    for (const field in filters) {
      const filter = filters[field];
      let operation = Op.substring;
      let value = filter.value;

      switch (filter.type) {
        case "EQUALS":
          operation = Op.eq;
          break;
        case "AND":
          operation = Op.and;
          break;
        case "BETWEEN":
          operation = Op.between;
          value = [filter.values.start, filter.values.end];
          break;
        case "IN": {
          operation = Op.in;
          value = filter.values;
          break;
        }
      }

      if (field.includes(".")) {
        const applyFilterOnChildrenTable = (field) => {
          const [tableName, fieldName, ...child] = field.split(".");
          const innerInclude = [];

          const tableToFilter = {
            model: db[tableName],
            as: tableName,
            required: true,
          };

          if (child.length > 0) {
            innerInclude.push(
              applyFilterOnChildrenTable(`${fieldName}.${child[0]}`)
            );
          } else {
            tableToFilter.where = {};
            tableToFilter.where[fieldName] = {
              [operation]: value,
            };
          }
          if (innerInclude.length > 0) {
            tableToFilter.include = innerInclude;
          }
          return tableToFilter;
        };
        include.push(applyFilterOnChildrenTable(field));
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
    const total = list.rows.length;
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
