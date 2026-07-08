const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.lrdzdvhanrfiocxylnms:D0unMJ2dpy5blVuN@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT DEFAULT '',
    password_hash TEXT NOT NULL,
    reset_token TEXT,
    reset_token_expires_at BIGINT,
    created_at BIGINT NOT NULL,
    last_login BIGINT NOT NULL,
    level INT DEFAULT 1,
    xp INT DEFAULT 0,
    coins INT DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at BIGINT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)`,
  `CREATE TABLE IF NOT EXISTS user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_gyms INT DEFAULT 0,
    total_hooh_runs INT DEFAULT 0,
    total_time_ms BIGINT DEFAULT 0,
    streak_current INT DEFAULT 0,
    streak_best INT DEFAULT 0,
    achievements JSONB DEFAULT '[]'
  )`,
  `CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    preferences JSONB DEFAULT '{}',
    cooldowns JSONB DEFAULT '{}'
  )`,
  `CREATE TABLE IF NOT EXISTS user_history (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    gym_history JSONB DEFAULT '[]',
    hooh_history JSONB DEFAULT '[]',
    run_history JSONB DEFAULT '[]'
  )`,
  `CREATE TABLE IF NOT EXISTS user_daily (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    tasks_state JSONB
  )`,
  `CREATE TABLE IF NOT EXISTS user_progression (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data JSONB DEFAULT '{}'
  )`,
  `CREATE TABLE IF NOT EXISTS user_cooldowns (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data JSONB DEFAULT '{}'
  )`,
];

async function run() {
  await client.connect();
  console.log('✅ Connected to Supabase PostgreSQL\n');

  for (const stmt of statements) {
    try {
      await client.query(stmt);
      const name = stmt.match(/TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i)?.[1] || stmt.substring(0, 40);
      console.log(`✓ Created: ${name}`);
    } catch (err) {
      console.error(`✗ Error:`, err.message);
      console.error('  Statement:', stmt.substring(0, 80));
    }
  }

  // Verify
  const { rows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log('\n📋 Tables now in Supabase:');
  rows.forEach(r => console.log(' -', r.table_name));

  await client.end();
  console.log('\n🎉 Done!');
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
