import { Router } from "express";
import { attachDefaultRoutes, loadRoutes } from "./route-utils";
import DefaultController from "./controllers/default-controller";
import CandidateController from "./controllers/candidate.controller";
import db from "./models";
import FilterController from "./controllers/filter.controller";

const routes = Router();

const experienceURL = "experience";
const technologyURL = "technology";
const candiadteTechnologyURL = "candidate-technology";
const candidateURL = "candidate";

const experienceController = new DefaultController({ model: db.experience });
const technologyController = new DefaultController({ model: db.technology });
const candidateTechnologyController = new DefaultController({ model: db.candidate_technology });
const candidateController = new CandidateController({ model: db.candidate });
const filterController = new FilterController({
  candidateController,
  experienceController,
  technologyController,
});

loadRoutes(routes);
attachDefaultRoutes(experienceURL, experienceController);
attachDefaultRoutes(technologyURL, technologyController);
attachDefaultRoutes(candiadteTechnologyURL, candidateTechnologyController);
attachDefaultRoutes(candidateURL, candidateController);

routes.get(
  "/availableFilter",
  filterController.getAvailableFilters.bind(filterController)
);

// Only for tests
// routes.get(
//   "/populateCandidateTable",
//   candidateController.populateCandidateTable.bind(candidateController)
// );

export default routes;
