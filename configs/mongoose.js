const { default: mongoose } = require("mongoose");
const startProductWatcher = require("../Elastic/productSync");

const initMongoDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB database connected successfully !!!");

        mongoose.connection.once('open', () => {
  console.log('✅ Mongo connected');
  startProductWatcher();
});

    } catch (error) {
        console.log("Unable to connect MongoDB database !!!");
        console.log(error);
    }
};

module.exports = initMongoDatabase;
