import { Tracer } from "@opentelemetry/api";
import { IRequest } from "itty-router";
import { Kysely } from "kysely";
import { Miniflare } from "miniflare";
import { Toucan } from "toucan-js";
import { ABREntryType, ABRTournamentType } from "./lib/abr.js";
import { Database, Tournament } from "./schema.js";

export type IngestResultQueueMessage = {
  tournament: Tournament;
  entry: ABREntryType;
};

type TriggerType = "api" | "cron";

export type IngestTournamentQueueMessage = {
  tournament: ABRTournamentType;
  trigger: TriggerType;
};

// declare what's available in our env
export type Env = {
  ENVIRONMENT: string;
  IS_TEST: boolean;
  LOGGED_IN_USER_ID: number | null;
  DB: D1Database;
  BACKUP_BUCKET: R2Bucket;
  INGEST_TOURNAMENT_Q: Queue<IngestTournamentQueueMessage>;
  INGEST_RESULT_Q: Queue<IngestResultQueueMessage>;
  // TODO: types for cards
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  INGEST_CARD_Q: Queue<any>;
  LEADERBOARD_KV: KVNamespace;
  CARDS_KV: KVNamespace;
  // Auth secrets
  JWT_SIGNER_SECRET_KEY: string;
  PASSWORD_SECRET_KEY: string;
  // NRDB OAuth secrets
  NRDB_OAUTH_CLIENT_ID: string;
  NRDB_OAUTH_CLIENT_SECRET: string;
  REDIRECT_BASE_URL: string;
  // Sentry
  SENTRY_DSN: string;
  SENTRY_RELEASE: string;
  // Honeycomb
  HONEYCOMB_API_KEY: string;
};

//type CF = [env: Env, context: ExecutionContext]

// define a custom RequestType to inject db into the request
export type RequestWithDB = {
  db: Kysely<Database>;
  user_id: number | null;
  is_admin: boolean | null;
} & IRequest;

export type G = {
  db: Kysely<Database>;
  sentry?: Toucan;
  mf?: Miniflare;
  tracer?: Tracer;
};
