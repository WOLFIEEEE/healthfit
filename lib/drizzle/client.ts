import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from "postgres";

config({ path: ".env.local", quiet: true });

function createPostgresClient() {
  return postgres(process.env.DATABASE_URL!, {
    connect_timeout: 10,
    idle_timeout: 20,
    max: 1,
    prepare: false,
  });
}

function createDb(client: ReturnType<typeof createPostgresClient>) {
  return drizzle({
    client,
    schema,
  });
}

const globalForDrizzle = globalThis as typeof globalThis & {
  __healthfitPostgresClient?: ReturnType<typeof createPostgresClient>;
  __healthfitDb?: ReturnType<typeof createDb>;
};

const client = globalForDrizzle.__healthfitPostgresClient ?? createPostgresClient();

if (process.env.NODE_ENV !== "production") {
  globalForDrizzle.__healthfitPostgresClient = client;
}

export const db = globalForDrizzle.__healthfitDb ?? createDb(client);

if (process.env.NODE_ENV !== "production") {
  globalForDrizzle.__healthfitDb = db;
}
