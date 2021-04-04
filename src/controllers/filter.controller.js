export default class FilterController {
  constructor(config) {
    this.candidateController = config.candidateController;
    this.experienceController = config.experienceController;
    this.technologyController = config.technologyController;
  }

  formatJsonResponse(response, cities, experiences, technologies) {
    return response.json({
      filters: {
        cities,
        experiences,
        technologies,
      },
    });
  }

  async getAvailableFilters(request, response) {
    request.query = { ...request.query, usePagination: 0 };

    const candidates = await this.candidateController.indexData(request, false);
    const experiences = await this.experienceController.indexData(request);
    const technologies = await this.technologyController.indexData(request);

    const removeDuplicated = (list) => {
      let set = new Set(list);
      let values = set.values();
      return Array.from(values);
    };

    const cities = removeDuplicated(
      candidates.data.map((candidate) => candidate.cityName)
    ).sort();

    return this.formatJsonResponse(
      response,
      cities,
      experiences.data.map((experience) => experience.name),
      technologies.data.map((technology) => technology.name)
    );
  }
}
