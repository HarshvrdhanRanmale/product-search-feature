const request = require("supertest");
const app = require("../server.cjs");

describe("ShopEasy API", () => {
  test("health endpoint reports UP", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "UP" });
  });

  test("product endpoint returns six products", async () => {
    const response = await request(app).get("/api/products");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(6);
  });

  test("products include names, categories, and numeric prices", async () => {
    const response = await request(app).get("/api/products");

    expect(response.body[0]).toMatchObject({
      id: 1,
      name: "Cloud headphones",
      category: "Electronics",
    });
    expect(typeof response.body[0].price).toBe("number");
  });
});