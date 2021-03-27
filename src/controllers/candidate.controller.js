import "regenerator-runtime";
import axios from "axios";
import fallbackData from "../../assets/fallback-data.json";

export default class CandidateController {
  async getDataFromAPI(useFallback) {
    const getDataFromFallback = () => fallbackData;
    const s3repo = "https://geekhunter-recruiting.s3.amazonaws.com/";
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

  loadArrays(data, fieldName) {
    return data.reduce((acumulator, currentCandidate) => {
      const currentObject = currentCandidate[fieldName];
      if (!acumulator.includes(currentObject)) {
        acumulator.push(currentObject);
      }
      return acumulator;
    }, []);
  }

  loadCities(data) {
    return this.loadArrays(data, "city").sort();
  }

  loadExperiences(data) {
    return this.loadArrays(data, "experience").sort(
      (experienceLeft, experienceRight) => {
        const getExperienceNumber = (expString) => {
          let extractedNumber = Number(expString.slice(0, 2));
          if (Number.isNaN(extractedNumber)) {
            extractedNumber = Number(expString.slice(0, 1));
          }
          return extractedNumber;
        };

        const numberExpLeft = getExperienceNumber(experienceLeft);
        const numberExpRight = getExperienceNumber(experienceRight);

        return numberExpLeft - numberExpRight;
      }
    );
  }

  loadTechnologies(data) {
    return data
      .reduce((acumulator, currentCandidate) => {
        currentCandidate.technologies.forEach((currentTechnology) => {
          if (!acumulator.includes(currentTechnology.name)) {
            acumulator.push(currentTechnology.name);
          }
        });
        return acumulator;
      }, [])
      .sort();
  }

  async getAvailableFilters(request, response) {
    const { useFallback = 0 } = request.query;

    const {
      data: { candidates: apiData },
    } = await this.getDataFromAPI(useFallback);

    return response.json({
      filters: {
        cities: this.loadCities(apiData),
        experiences: this.loadExperiences(apiData),
        technologies: this.loadTechnologies(apiData),
      },
    });
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
    const { page = 1, useFallback = 0, usePagination = 1,  rowsPerPage = 10 } = request.query;
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

    const { total, limit, offset, pages } = this.loadAdditionalInformation(apiData, usePagination, rowsPerPage, page);

    apiData = [...apiData].splice(offset, limit);

    return this.formatJsonResponse(response, apiData, total, offset, limit, page, pages);
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
