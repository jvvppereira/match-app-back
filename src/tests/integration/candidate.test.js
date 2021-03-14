import "regenerator-runtime";
import request from "supertest";
import app from "../../app";

const doRequest = async (
  queryParams = {},
  body = {},
  endpoint = "/candidate"
) => {
  const { page = 1, useFallback = 0, usePagination = 1 } = queryParams;
  return await request(app)
    .get(
      `${endpoint}?useFallback=${useFallback}&usePagination=${usePagination}&page=${page}`
    )
    .send(body);
};

describe("Load candidates", () => {
  describe("Access to API", () => {
    it("should connect to API", async () => {
      const response = await doRequest();

      expect(response.statusCode).toBe(200);
    });

    it("should use API fallback", async () => {
      const response = await doRequest({ useFallback: 1 });

      expect(response.statusCode).toBe(200);
    });
  });

  describe("Get candidates from API", () => {
    it("should return all candidates", async () => {
      const response = await doRequest({ usePagination: 0 });

      expect(response.body.total).toBe(100);
    });

    it("should return all candidates paged at page 1", async () => {
      const response = await doRequest({ page: 1 });

      expect(response.body.offset).toBe(0);
      expect(response.body.limit).toBe(12);
    });

    it("should return all candidates paged at page 2", async () => {
      const response = await doRequest({ page: 2 });

      expect(response.body.offset).toBe(12);
      expect(response.body.limit).toBe(12);
    });
  });

  describe("Get candidates filtered from API", () => {
    it("should return candidates filtered by locale", async () => {
      const filters = {
        locales: ["Florianópolis - SC"],
      };

      const response = await doRequest({ usePagination: 0 }, filters);

      expect(response.body.total).toBe(4);
    });

    it("should return candidates filtered by 2 locales", async () => {
      const filters = {
        locales: ["Florianópolis - SC", "Indaial - SC"],
      };

      const response = await doRequest({ usePagination: 0 }, filters);

      expect(response.body.total).toBe(5);
    });

    it("should return candidates filtered by technology", async () => {
      const filters = {
        technologies: ["Ruby"],
      };

      const response = await doRequest({ usePagination: 0 }, filters);

      expect(response.body.total).toBe(2);
    });

    it("should return candidates filtered by 2 technologies", async () => {
      const filters = {
        technologies: ["Ruby", "Ruby on Rails"],
      };

      const response = await doRequest({ usePagination: 0 }, filters);

      expect(response.body.total).toBe(4);
    });

    it("should return candidates filtered by experience", async () => {
      const filters = {
        experiences: ["1-2 years"],
      };

      const response = await doRequest({ usePagination: 0 }, filters);

      expect(response.body.total).toBe(13);
    });

    it("should return candidates filtered by 2 experiences", async () => {
      const filters = {
        experiences: ["1-2 years", "3-4 years"],
      };

      const response = await doRequest({ usePagination: 0 }, filters);

      expect(response.body.total).toBe(28);
    });

    it("should return candidates filtered by locale, technology and experience", async () => {
      const filters = {
        locales: ["Florianópolis - SC"],
        technologies: ["Ruby", "Ruby on Rails"],
        experiences: [
          "1-2 years",
          "3-4 years",
          "5-6 years",
          "7-8 years",
          "8-9 years",
          "10-11 years",
          "12+ years",
        ],
      };

      const response = await doRequest({ usePagination: 0 }, filters);

      expect(response.body.total).toBe(1);
    });
  });
});
