const express = require("express");
require("dotenv/config");
const logger = require("./configs/logger");
const initMongoDatabase = require("./configs/mongoose");

const app = express();

// Middleware
app.use(express.json());

// Logger
app.use((req, res, next) => {
   const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    user_agent: req.headers["user-agent"],
    timestamp: new Date().toISOString()
  };
  logger.info("INCOMING REQUEST DATA: ", logData);
  next();
});

// Routes
app.use("/products", require("./routes/product.route"));

// MongoDB setup
(async () => initMongoDatabase())();

// Create server on localhost
(async () => {
  try {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT);
    console.log(`Server started on http://localhost:${PORT} !!!`);
  } catch (error) {
    console.log("Unable to start server !!!");
    console.log(error);
  }
})();
