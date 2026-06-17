import pkg from 'pg';

const { Client } = pkg;

const runMigration = async () => {
  const client = new Client({
    connectionString: 'postgresql://postgres:KaushalBusinessMan261@@db.ryygdyzwzjnvsijqasiz.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase DB.');
    
    const sql = `
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'trial';
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_started_at timestamptz DEFAULT now();
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz DEFAULT (now() + interval '14 days');
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial';
    `;
    
    await client.query(sql);
    console.log('Migration executed successfully.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
};

runMigration();
