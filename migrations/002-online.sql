-- VEILFALL R100 online persistence schema. Executed by server/service.cjs.
-- Email columns are added conditionally in JS because SQLite ADD COLUMN lacks IF NOT EXISTS.
   CREATE TABLE IF NOT EXISTS account_tokens(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,purpose TEXT NOT NULL CHECK(purpose IN ('reset','verify')),expires INTEGER NOT NULL);
   CREATE INDEX IF NOT EXISTS account_tokens_expiry ON account_tokens(expires);
   CREATE TABLE IF NOT EXISTS player_saves(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,slot INTEGER NOT NULL CHECK(slot BETWEEN 1 AND 3),revision INTEGER NOT NULL DEFAULT 1,document TEXT NOT NULL,updated INTEGER NOT NULL,PRIMARY KEY(user_id,slot));
   CREATE TABLE IF NOT EXISTS save_revisions(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,slot INTEGER NOT NULL,revision INTEGER NOT NULL,document TEXT NOT NULL,created INTEGER NOT NULL,PRIMARY KEY(user_id,slot,revision));
   CREATE TABLE IF NOT EXISTS progression_reports(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,global_stage INTEGER NOT NULL,world INTEGER NOT NULL,stage INTEGER NOT NULL,verification TEXT NOT NULL DEFAULT 'unverified',updated INTEGER NOT NULL);
   CREATE INDEX IF NOT EXISTS progression_rank ON progression_reports(verification,global_stage DESC,updated ASC,user_id);
   CREATE INDEX IF NOT EXISTS raids_by_clan_result ON raids(clan_id,status,level DESC,completed);
   CREATE INDEX IF NOT EXISTS clan_members_by_clan ON members(clan_id);

