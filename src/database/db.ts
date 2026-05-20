import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const url: string = process.env.MONGO_URI as string;
let connection: typeof mongoose;
let mongooseConnectionPromise: Promise<typeof mongoose> | null = null;
let mongoClientConnectionPromise: Promise<MongoClient> | null = null;

// Create a native MongoDB client instance for better-auth
export const client = new MongoClient(url);

const connectMongoClient = async () => {
  if (!mongoClientConnectionPromise) {
    mongoClientConnectionPromise = client.connect();
  }

  return mongoClientConnectionPromise;
};

/**
 * Makes a connection to a MongoDB database. If a connection already exists, does nothing
 * Call this function before all api routes
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  await connectMongoClient();

  if (connection) {
    return connection;
  }

  if (!mongooseConnectionPromise) {
    mongooseConnectionPromise = mongoose.connect(url);
  }

  connection = await mongooseConnectionPromise;
  return connection;
};

export default connectDB;
