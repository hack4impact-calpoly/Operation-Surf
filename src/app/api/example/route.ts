import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

/**
 * Handles GET requests to check database connectivity and status.
 * @returns {Promise<NextResponse>} JSON response with database status and latency.
 */
export async function GET(): Promise<NextResponse> {
  try {
    // 1. Attempt to connect to the database
    await connectDB();

    // 2. Check the connection state
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const dbStatus = mongoose.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    const currentState = states[dbStatus] || "unknown";

    // Ensure the database connection is established before proceeding
    if (dbStatus !== 1 || !mongoose.connection.db) {
      throw new Error("Database connection is not fully established.");
    }

    // 3. Perform a "Ping" command to ensure the database is responsive
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - start;

    // 4. Return a success response with database details
    return NextResponse.json(
      {
        status: "success",
        database: {
          state: currentState,
          latency: `${latency}ms`,
          databaseName: mongoose.connection.name,
        },
        message: "Database is reachable and responding to commands.",
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    // Handle errors and return a detailed error response
    console.error("Database Test Error:", error);
    console.log("hello");
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to the database.",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

// import connectDB from "@/database/db";
// import { NextResponse } from "next/server";

// /**
//  * Example GET API route
//  * @returns {message: string}
//  */
// export async function GET() {
//   await connectDB();
//   return NextResponse.json({ message: "Hello from the API!" });
// }
