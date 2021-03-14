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
    // const { filters } = request.body;

    const usingPagination = () => usePagination == 1;

    let {
      data: { candidates: apiData },
    } = await this.getDataFromAPI(useFallback);

    const total = apiData.length;
    const limit = usingPagination() ? 12 : total;
    const offset = usingPagination() ? (page - 1) * limit : 0;
    const pages = usingPagination() ? Math.ceil(total / limit) : 1;

    apiData = [ ...apiData ].splice(offset, limit);

    return response.json({
      data: apiData,
      total,
      limit,
      page: Number(page),
      pages,
    });
  }
}
