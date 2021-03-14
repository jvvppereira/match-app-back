import "regenerator-runtime";
import request from "supertest";
import app from "../../app";

describe("Load candidates", () => {
  describe("Access to API", () => {
    it("should connect to API", async () => {
      const response = await request(app).get("/candidate");

      expect(response.statusCode).toBe(200);
    });

    it("should use fallback of API", async () => {
      const endpoint = "/candidate";
      const useFallback = 1;

      const response = await request(app).get(`${endpoint}?useFallback=${useFallback}`);

      expect(response.statusCode).toBe(200);
    });
  });

  it("should return all candidates", () => {
    expect("").toBe("");
  });

  it("should return all candidates paginationed at page 1", () => {
    expect("").toBe("");
  });

  it("should return all candidates paginationed at page 2", () => {
    expect("").toBe("");
  });

  it("should return candidates filtered by locale", () => {
    expect("").toBe("");
  });
});
