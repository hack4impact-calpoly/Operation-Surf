import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const url = process.env.MONGO_URI;
const fallbackUrl = "mongodb://127.0.0.1:27017/operation-surf-build";
let connection: typeof mongoose;
let mongooseConnectionPromise: Promise<typeof mongoose> | null = null;
let mongoClientConnectionPromise: Promise<MongoClient> | null = null;

// Avoid crashing during Next.js build analysis when envs are not loaded yet.
export const client = new MongoClient(url ?? fallbackUrl);

function getMongoUri(): string {
  if (!url) {
    throw new Error("MONGO_URI is not set.");
  }

  return url;
}

const connectMongoClient = async () => {
  getMongoUri();

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
  const mongoUri = getMongoUri();
  await connectMongoClient();

  if (connection) {
    return connection;
  }

  if (!mongooseConnectionPromise) {
    mongooseConnectionPromise = mongoose.connect(mongoUri);
  }

  connection = await mongooseConnectionPromise;
  return connection;
};

export default connectDB;
