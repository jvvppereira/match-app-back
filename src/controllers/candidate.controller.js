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

  async getAll(request, response) {
    const { page = 1, useFallback = 0, usePagination = 1 } = request.query;
    const { locales = [], technologies = [], experiences = [] } = request.body;

    const filters = { locales, technologies, experiences };

    const usingPagination = () => usePagination == 1;

    let {
      data: { candidates: apiData },
    } = await this.getDataFromAPI(useFallback);

    apiData = this.applyFilters(apiData, filters);

    const total = apiData.length;
    const limit = usingPagination() ? 12 : total;
    const offset = usingPagination() ? (page - 1) * limit : 0;
    const pages = usingPagination() ? Math.ceil(total / limit) : 1;

    apiData = [...apiData].splice(offset, limit);

    return response.json({
      data: apiData,
      total,
      offset,
      limit,
      page: Number(page),
      pages,
    });
  }

  applyFilters(rows, filters) {
    const localeFilter = (candidate) =>
      filters.locales.length == 0 || filters.locales.includes(candidate.city);

    const technologyFilter = (candidate) =>
      filters.technologies.length == 0 ||
      candidate.technologies.filter((technology) =>
        filters.technologies.includes(technology.name)
      ).length > 0;

    const experienceFilter = (candidate) =>
      filters.experiences.length == 0 || filters.experiences.includes(candidate.experience);

    return rows.filter(localeFilter).filter(technologyFilter).filter(experienceFilter);
  }
}
