import express, { json } from "express";
import cors from "cors";
import routes from "./routes";

class AppController {
  constructor() {
    this.express = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.express.use(json());
    this.express.use(cors());
  }

  routes() {
    this.express.use(routes);
  }
}

module.exports = new AppController().express;
