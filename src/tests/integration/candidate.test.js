import "regenerator-runtime";
import request from "supertest";
import app from "../../app";

const doRequest = async (queryParams = {}, endpoint = "/candidate") => {
  const { page = 1, useFallback = 0, usePagination = 1 } = queryParams;
  return await request(app).get(
    `${endpoint}?useFallback=${useFallback}&usePagination=${usePagination}&page=${page}`
  );
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

  it("should return candidates filtered by locale", async () => {
    const response = await doRequest();

    expect("").toBe("");//TODO
  });
});
