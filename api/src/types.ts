import { Database } from "./models";
import { ABREntryType, ABRTournamentType } from "./lib/abr";
import { IRequest } from "itty-router";
import { Kysely } from "kysely";

export type IngestResultQueueMessage = {
  tournament: ABRTournamentType;
  entry: ABREntryType;
};

// declare what's available in our env
export type Env = {
  DB: D1Database;
  INGEST_TOURNAMENT_Q: Queue<ABRTournamentType>;
  INGEST_RESULT_Q: Queue<IngestResultQueueMessage>;
  // TODO: types for cards
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
};

//type CF = [env: Env, context: ExecutionContext]

// define a custom RequestType to inject db into the request
export type RequestWithDB = {
  db: Kysely<Database>;
  user_id: number | null;
  is_admin: boolean | null;
} & IRequest;
