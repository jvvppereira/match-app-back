import { Op } from 'sequelize';

require('dotenv').config();

export const username = process.env.DATABASE_USERNAME;
export const password = process.env.DATABASE_PASSWORD;
export const database = process.env.DATABASE_NAME;
export const host = process.env.DATABASE_HOST;
export const dialect = 'mysql';
export const operatorsAliases = {
  $gt: Op.gt
};
