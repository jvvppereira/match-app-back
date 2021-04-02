import db from "../models";

export default class FilterController {
  constructor(config) {
    this.candidateController = config.candidateController;
    this.experienceController = config.experienceController;
    this.technologyController = config.technologyController;
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
    const { useFallback = 0, useApi = 0 } = request.query;

    if (useApi) {
      const {
        data: { candidates: apiData },
      } = await this.candidateController.getDataFromAPI(useFallback);

      return this.formatJsonResponse(
        response,
        this.loadCities(apiData),
        this.loadExperiences(apiData),
        this.loadTechnologies(apiData)
      );
    } else {
      const dbCandidates = await db.candidate.findAll();
      const dbExperiences = await db.experience.findAll();
      const dbTechnology = await db.technology.findAll();

      const removeDuplicated = (list) => {
        let set = new Set(list);
        let values = set.values();
        return Array.from(values);
      };

      const cities = removeDuplicated(
        dbCandidates.map((candidate) => candidate.cityName)
      ).sort();

      console.log(cities);

      return this.formatJsonResponse(
        response,
        cities,
        dbExperiences.map((experience) => experience.name),
        dbTechnology.map((technology) => technology.name)
      );
    }
  }
}
