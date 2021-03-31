import candidate from "../models/candidate";

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

  async getAvailableFilters(request, response) {
    const { useFallback = 0, useDataBase = 1 } = request.query;

    if (useDataBase) {
      return {};
    } else {
      const {
        data: { candidates: apiData },
      } = await this.candidateController.getDataFromAPI(useFallback);

      return response.json({
        filters: {
          cities: this.loadCities(apiData),
          experiences: this.loadExperiences(apiData),
          technologies: this.loadTechnologies(apiData),
        },
      });
    }
  }
}
