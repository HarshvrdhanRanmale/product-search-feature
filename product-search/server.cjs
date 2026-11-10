const express = require("express");
const path = require("path");
const products = require("./src/products.json");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.get("/api/products", (req, res) => {
  res.status(200).json(products);
});

app.use(express.static(path.join(__dirname, "dist")));

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`ShopEasy server running on port ${port}`);
  });
}