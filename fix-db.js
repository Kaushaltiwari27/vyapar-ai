const { Client } = require('pg');

const connectionString = 'postgresql://postgres:KaushalBusinessMan261@@db.ryygdyzwzjnvsijqasiz.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

async function fixDB() {
  await client.connect();

  try {
    console.log("Fixing RLS Policies...");

    const sql = `
      -- Allow authenticated users to insert a new business (so signup works)
      CREATE POLICY "Allow inserts on businesses" ON businesses FOR INSERT TO authenticated WITH CHECK (true);
      
      -- Allow authenticated users to insert their own profile
      CREATE POLICY "Allow inserts on profiles" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
    `;

    await client.query(sql);
    console.log("RLS policies updated successfully.");
  } catch (err) {
    console.error("Error running SQL:", err);
  } finally {
    await client.end();
  }
}

fixDB();
