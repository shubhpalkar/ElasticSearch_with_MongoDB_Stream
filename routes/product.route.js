const logger = require("../configs/logger");
const express = require("express");
const productController = require("../controllers/product.controller");

const router = new express.Router();

// Add a new product
router.post("/", async (req, res) => {
    logger.info("ROUTE: ADD A NEW PRODUCT");
    await productController.add(req, res);
});

// Update a specific product
router.put("/:id", async (req, res) => {
    logger.info("ROUTE: UPDATE A SPECIFIC PRODUCT");
    await productController.update(req, res);
});

// Remove a specific product
router.delete("/:id", async (req, res) => {
  logger.info("ROUTE: UPDATE A SPECIFIC PRODUCT");
  await productController.remove(req, res);
});

// Search product
router.get("/search", async (req, res) => {
    logger.info("ROUTE: SEARCH PRODUCT");
    await productController.search(req, res);
});

// Suggest product
router.get("/suggest", async (req, res) => {
    logger.info("ROUTE: SUGGEST PRODUCT");
    await productController.suggest(req, res);
});

module.exports = router;
