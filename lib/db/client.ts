import { neon, Pool } from "@neondatabase/serverless";
import { drizzle as drizzleHttp } from "drizzle-orm/neon-http";
import { drizzle as drizzlePool } from "drizzle-orm/neon-serverless";
import * as schema from "@/lib/db/schema";

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

let httpDb: ReturnType<typeof drizzleHttp<typeof schema>> | undefined;

// Single-statement reads. Cheap, stateless, one HTTP round trip per query —
// do not use this for the seal/submit transaction, see getPooledDb below.
export function getDb() {
  if (!httpDb) {
    httpDb = drizzleHttp(neon(requireDatabaseUrl()), { schema });
  }
  return httpDb;
}

let pool: Pool | undefined;
let pooledDb: ReturnType<typeof drizzlePool<typeof schema>> | undefined;

// Real interactive transactions over a WebSocket connection — required for
// `select ... for update` (see the submit transaction in lib/db/rounds.ts).
// The HTTP driver above cannot hold a transaction open across statements.
export function getPooledDb() {
  if (!pooledDb) {
    pool = new Pool({ connectionString: requireDatabaseUrl() });
    pooledDb = drizzlePool(pool, { schema });
  }
  return pooledDb;
}
