// server/db.ts

import WebSocket from "ws";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";

// Tell the Neon client to use the ws package for WebSocket connections
neonConfig.webSocketConstructor = WebSocket;

// Ensure we have a DATABASE_URL
const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision your database?"
  );
}

// Create a serverless Postgres pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Initialize Drizzle ORM over that pool with your schema
export const db = drizzle({
  client: pool,
  schema,
});
