const { Client } = require("@elastic/elasticsearch");

const esClient = new Client({
    node: process.env.ES_NODE, // Elasticsearch node URL
    compact: true // Optional: compact responses for easier parsing
});

module.exports = esClient;
