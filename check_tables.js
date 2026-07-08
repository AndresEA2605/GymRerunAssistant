const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.lrdzdvhanrfiocxylnms:D0unMJ2dpy5blVuN@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  const { rows } = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('Tables in public schema:');
  rows.forEach(r => console.log(' -', r.table_name));
  await client.end();
}

run().catch(console.error);
