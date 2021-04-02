import "regenerator-runtime";
import axios from "axios";
import fallbackData from "../../assets/fallback-data.json";
import Sequelize from "sequelize";
const Op = Sequelize.Op;
import db from "../models";
import DefaultController from "./default-controller";
export default class CandidateController extends DefaultController {
  constructor(config) {
    super(config);
  }

  async getDataFromAPI(useFallback) {
    const getDataFromFallback = () => fallbackData;
    const s3repo = process.env.S3_REPO;
    const connectionDefaultAPI = axios.create({ baseURL: s3repo });
    let data;

    if (useFallback) {
      data = getDataFromFallback();
    } else {
      try {
        data = await connectionDefaultAPI.get("code_challenge.json");
      } catch (error) {
        console.error(error.message);
        data = getDataFromFallback();
      }
    }

    return data;
  }

  async populateCandidateTable(request, response) {
    const {
      data: { candidates },
    } = await this.getDataFromAPI(false);

    const dbExperiences = await db.experience.findAll();
    const dbTechnology = await db.technology.findAll();

    candidates.map(async (candidate) => {
      const experienceId = dbExperiences.find(
        (experience) =>
          candidate.experience.replace("years", "anos") == experience.name
      ).id;

      const dbCandidate = {
        visualId: candidate.id,
        cityName: candidate.city,
        experienceId,
      };

      const candidateSaved = await db.candidate.create(dbCandidate);

      candidate.technologies.map((technology) => {
        const technologyId = dbTechnology.find(
          (tech) => technology.name == tech.name
        ).id;

        const dbCandidateTechnology = {
          candidateId: candidateSaved.id,
          mainTechnology: technology.is_main_tech,
          technologyId,
        };

        db.candidate_technology.create(dbCandidateTechnology);
      });
    });

    const dbCandidateTechnology = await db.candidate_technology.findAndCountAll();
    const dbCandidate = await db.candidate.findAndCountAll();

    return response.json({
      candidateCount: dbCandidate.count,
      candidateTechnologyCount: dbCandidateTechnology.count,
    });
  }

  async indexData(request) {
    const include = [];

    return super.indexData(request, include);
  }
}
