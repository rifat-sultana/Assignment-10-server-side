const { MongoClient, ServerApiVersion } = require("mongodb");

let database;

const connectDB = async () => {
 
  const uri = process.env.MONGO_DB_URI;
  if (!uri) {
    throw new Error('Please define the MONGO_URI environment variable');
  } else {
    console.log('Got values from environment!!')
  }

  const client = new MongoClient(process.env.MONGO_DB_URI, {
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