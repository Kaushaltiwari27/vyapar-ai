import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

const runMigration = async () => {
  const client = new Client({
    connectionString: 'postgresql://postgres:KaushalBusinessMan261@@db.ryygdyzwzjnvsijqasiz.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to Supabase DB.');
    
    const sql = fs.readFileSync('schema.sql', 'utf8');
    
    await client.query(sql);
    console.log('Migration executed successfully.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end();
  }
};

runMigration();
