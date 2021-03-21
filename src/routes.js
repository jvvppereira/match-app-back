import { Router } from "express";
import CandidateController from "./controllers/candidate.controller";

const routes = Router();

const candidateController = new CandidateController();

routes.patch("/candidate", candidateController.getAll.bind(candidateController));
routes.get("/availableFilter", candidateController.getAvailableFilters.bind(candidateController));

export default routes;
