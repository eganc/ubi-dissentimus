import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    mode: text("mode").notNull(),
    status: text("status").notNull().default("open"),
    cruxId: text("crux_id"),
    rootRoundId: uuid("root_round_id"),
    activeRoundId: uuid("active_round_id"),
    publishState: text("publish_state").notNull().default("private"),
    shareId: text("share_id").unique(),
    hostTokenHash: text("host_token_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    check("sessions_mode_check", sql`${table.mode} in ('group','solo')`),
    check("sessions_status_check", sql`${table.status} in ('open','closed')`),
    check(
      "sessions_publish_state_check",
      sql`${table.publishState} in ('private','pending','published')`,
    ),
  ],
);

export const participants = pgTable(
  "participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    tokenHash: text("token_hash").notNull(),
    role: text("role").notNull(),
    active: boolean("active").notNull().default(true),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("participants_role_check", sql`${table.role} in ('host','participant')`),
    index("participants_session_id_idx").on(table.sessionId),
  ],
);

export const rounds = pgTable(
  "rounds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    parentRoundId: uuid("parent_round_id"),
    depth: integer("depth").notNull(),
    claimText: text("claim_text").notNull().default(""),
    claimHash: text("claim_hash"),
    claimType: text("claim_type"),
    phase: text("phase").notNull().default("drafting"),
    expectedCount: integer("expected_count"),
    revealedAt: timestamp("revealed_at", { withTimezone: true }),
    outcome: text("outcome"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentRoundId],
      foreignColumns: [table.id],
      name: "rounds_parent_round_id_fkey",
    }).onDelete("cascade"),
    check("rounds_depth_check", sql`${table.depth} between 0 and 2`),
    check("rounds_claim_type_check", sql`${table.claimType} in ('evidence','value')`),
    check(
      "rounds_phase_check",
      sql`${table.phase} in ('drafting','sealed','revealed','closed')`,
    ),
    check(
      "rounds_outcome_check",
      sql`${table.outcome} in ('descended','bedrock','converged')`,
    ),
    index("rounds_session_id_idx").on(table.sessionId),
    index("rounds_parent_round_id_idx").on(table.parentRoundId),
  ],
);

export const entries = pgTable(
  "entries",
  {
    roundId: uuid("round_id")
      .notNull()
      .references(() => rounds.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    wouldChangeMyMind: text("would_change_my_mind").notNull(),
    refusedSources: text("refused_sources").notNull().default(""),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.roundId, table.participantId] })],
);

export const claimAcceptances = pgTable(
  "claim_acceptances",
  {
    roundId: uuid("round_id")
      .notNull()
      .references(() => rounds.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    claimHash: text("claim_hash").notNull(),
  },
  (table) => [primaryKey({ columns: [table.roundId, table.participantId] })],
);

export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roundId: uuid("round_id")
      .notNull()
      .references(() => rounds.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    body: text("body").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("proposals_kind_check", sql`${table.kind} in ('claim-wording','question')`),
    check("proposals_status_check", sql`${table.status} in ('pending','accepted','rejected')`),
  ],
);

export const ratifications = pgTable(
  "ratifications",
  {
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.proposalId, table.participantId] })],
);
