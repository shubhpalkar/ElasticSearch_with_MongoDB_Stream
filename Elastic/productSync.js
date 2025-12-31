const mongoose = require('mongoose');
const Product = require("../models/product.model");
const esClient = require("../configs/elasticsearch");


async function startWatcher() {
  const changeStream = Product.watch(
    [],
    { fullDocument: 'updateLookup' }
  );

  console.log('📡 Product Change Stream started');

  changeStream.on('change', async (change) => {
    try {
      switch (change.operationType) {
        case 'insert':
          await esClient.index({
            index: 'products',
            id: change.fullDocument._id.toString(),
            document: change.fullDocument
          });
          break;

        case 'update':
          await esClient.update({
            index: 'products',
            id: change.documentKey._id.toString(),
            doc: change.fullDocument
          });
          break;

        case 'delete':
          await esClient.delete({
            index: 'products',
            id: change.documentKey._id.toString()
          });
          break;
      }
    } catch (err) {
      console.error('❌ ES sync failed:', err);
    }
  });
}

module.exports = startWatcher;
