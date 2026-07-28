CREATE TABLE "claim_acceptances" (
	"round_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"claim_hash" text NOT NULL,
	CONSTRAINT "claim_acceptances_round_id_participant_id_pk" PRIMARY KEY("round_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"round_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	"would_change_my_mind" text NOT NULL,
	"refused_sources" text DEFAULT '' NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "entries_round_id_participant_id_pk" PRIMARY KEY("round_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE "participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"display_name" text NOT NULL,
	"token_hash" text NOT NULL,
	"role" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "participants_role_check" CHECK ("participants"."role" in ('host','participant'))
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"round_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"body" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "proposals_kind_check" CHECK ("proposals"."kind" in ('claim-wording','question')),
	CONSTRAINT "proposals_status_check" CHECK ("proposals"."status" in ('pending','accepted','rejected'))
);
--> statement-breakpoint
CREATE TABLE "ratifications" (
	"proposal_id" uuid NOT NULL,
	"participant_id" uuid NOT NULL,
	CONSTRAINT "ratifications_proposal_id_participant_id_pk" PRIMARY KEY("proposal_id","participant_id")
);
--> statement-breakpoint
CREATE TABLE "rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"parent_round_id" uuid,
	"depth" integer NOT NULL,
	"claim_text" text DEFAULT '' NOT NULL,
	"claim_hash" text,
	"claim_type" text,
	"phase" text DEFAULT 'drafting' NOT NULL,
	"expected_count" integer,
	"revealed_at" timestamp with time zone,
	"outcome" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rounds_depth_check" CHECK ("rounds"."depth" between 0 and 2),
	CONSTRAINT "rounds_claim_type_check" CHECK ("rounds"."claim_type" in ('evidence','value')),
	CONSTRAINT "rounds_phase_check" CHECK ("rounds"."phase" in ('drafting','sealed','revealed','closed')),
	CONSTRAINT "rounds_outcome_check" CHECK ("rounds"."outcome" in ('descended','bedrock','converged'))
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"mode" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"crux_id" text,
	"root_round_id" uuid,
	"active_round_id" uuid,
	"publish_state" text DEFAULT 'private' NOT NULL,
	"share_id" text,
	"host_token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "sessions_share_id_unique" UNIQUE("share_id"),
	CONSTRAINT "sessions_mode_check" CHECK ("sessions"."mode" in ('group','solo')),
	CONSTRAINT "sessions_status_check" CHECK ("sessions"."status" in ('open','closed')),
	CONSTRAINT "sessions_publish_state_check" CHECK ("sessions"."publish_state" in ('private','pending','published'))
);
--> statement-breakpoint
ALTER TABLE "claim_acceptances" ADD CONSTRAINT "claim_acceptances_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_acceptances" ADD CONSTRAINT "claim_acceptances_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_round_id_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratifications" ADD CONSTRAINT "ratifications_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratifications" ADD CONSTRAINT "ratifications_participant_id_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rounds" ADD CONSTRAINT "rounds_parent_round_id_fkey" FOREIGN KEY ("parent_round_id") REFERENCES "public"."rounds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "participants_session_id_idx" ON "participants" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "rounds_session_id_idx" ON "rounds" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "rounds_parent_round_id_idx" ON "rounds" USING btree ("parent_round_id");