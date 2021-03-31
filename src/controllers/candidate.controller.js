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

  formatJsonResponse(response, apiData, total, offset, limit, page, pages) {
    return response.json({
      data: apiData,
      total,
      offset,
      limit: Number(limit),
      page: Number(page),
      pages,
    });
  }

  loadAdditionalInformation(apiData, usePagination, rowsPerPage, page) {
    const usingPagination = () => usePagination == 1;

    const total = apiData.length;
    const limit = usingPagination() ? rowsPerPage : total;
    const offset = usingPagination() ? (page - 1) * limit : 0;
    const pages = usingPagination() ? Math.ceil(total / limit) : 1;

    return { total, limit, offset, pages };
  }

  async getAll(request, response) {
    const {
      page = 1,
      useFallback = 0,
      usePagination = 1,
      rowsPerPage = 10,
    } = request.query;
    const {
      cities = [],
      technologies = { wayToFilter: "or", list: [] },
      experiences = [],
    } = request.body;

    const filters = { cities, technologies, experiences };

    let {
      data: { candidates: apiData },
    } = await this.getDataFromAPI(useFallback);

    apiData = this.applyFilters(apiData, filters);

    const { total, limit, offset, pages } = this.loadAdditionalInformation(
      apiData,
      usePagination,
      rowsPerPage,
      page
    );

    apiData = [...apiData].splice(offset, limit);

    return this.formatJsonResponse(
      response,
      apiData,
      total,
      offset,
      limit,
      page,
      pages
    );
  }

  applyFilters(candidates, filters) {
    const cityFilter = (candidate) =>
      filters.cities.length == 0 || filters.cities.includes(candidate.city);

    const experienceFilter = (candidate) =>
      filters.experiences.length == 0 ||
      filters.experiences.includes(candidate.experience);

    const technologyFilter = (candidate) => {
      const filtersTechnologies = filters.technologies.list;
      const wayToFilter = filters.technologies.wayToFilter;

      const technologyFilterCore = () =>
        candidate.technologies.filter((technology) =>
          filtersTechnologies.includes(technology.name)
        ).length;

      const technologyOrFilter = () => technologyFilterCore() > 0;
      const technologyAndFilter = () =>
        technologyFilterCore() === filtersTechnologies.length;

      return (
        filtersTechnologies.length == 0 ||
        (wayToFilter == "or" && technologyOrFilter()) ||
        (wayToFilter == "and" && technologyAndFilter())
      );
    };

    return candidates
      .filter(cityFilter)
      .filter(technologyFilter)
      .filter(experienceFilter);
  }
}
