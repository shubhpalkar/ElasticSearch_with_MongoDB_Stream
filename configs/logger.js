const winston = require("winston");
const transport = require("winston-elasticsearch");

const logger = winston.createLogger({
  transports: [
    new transport.ElasticsearchTransport({
      level: "info",
      clientOpts: {
        node: process.env.ES_NODE_DOCKER // Elasticsearch node URL
      },
      indexPrefix: "express-logs" // Prefix for log index names
    })
  ]
});

module.exports = logger;
