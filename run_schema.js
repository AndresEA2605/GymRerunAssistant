const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.lrdzdvhanrfiocxylnms:D0unMJ2dpy5blVuN@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

const tables = [
  'users',
  'sessions',
  'user_stats',
  'user_settings',
  'user_history',
  'user_daily',
  'user_progression',
  'user_cooldowns',
];

async function run() {
  await client.connect();
  console.log('✅ Connected to Supabase\n');

  // Enable RLS on all tables
  for (const table of tables) {
    try {
      await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY`);
      console.log(`🔒 RLS enabled: ${table}`);
    } catch (err) {
      console.error(`✗ ${table}:`, err.message);
    }
  }

  // Add policies: service_role bypasses RLS automatically.
  // We add a policy so that no anon/authenticated direct access is allowed
  // (all access goes through our server routes with service_role key).
  // This is the most secure setup for a server-only API.
  console.log('\n📋 Adding restrictive policies (deny all direct API access)...');

  for (const table of tables) {
    try {
      // Drop existing policies first to avoid conflicts
      await client.query(`
        DO $$
        DECLARE r RECORD;
        BEGIN
          FOR r IN SELECT policyname FROM pg_policies WHERE tablename = '${table}' AND schemaname = 'public'
          LOOP
            EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.${table}';
          END LOOP;
        END$$
      `);
      console.log(`  ✓ Dropped existing policies on ${table}`);
    } catch (err) {
      console.error(`  ✗ Drop policies ${table}:`, err.message);
    }
  }

  // Verify RLS status
  const { rows } = await client.query(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);
  
  console.log('\n📊 RLS Status:');
  rows.forEach(r => {
    const status = r.rowsecurity ? '🔒 ENABLED' : '⚠️  disabled';
    console.log(`  ${status} — ${r.tablename}`);
  });

  await client.end();
  console.log('\n🎉 RLS setup complete! Service role key bypasses RLS server-side.');
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
