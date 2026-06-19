const { MongoClient, ServerApiVersion } = require("mongodb");

let database;

const connectDB = async () => {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();

  database = client.db("bibliodrop");

  console.log("MongoDB Connected");
};

const getDB = () => database;

module.exports = {
  connectDB,
  getDB,
};