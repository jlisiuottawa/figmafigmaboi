#!/usr/bin/env node
// Run with: DATABASE_URL="postgres://..." node scripts/run-garden-migrations.js

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'pg';
const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrations = [
  '../db/migrations/20251114_remove_duplicate_garden_items.sql',
  '../db/migrations/20251121_add_plant_health_tracking.sql',
  '../db/migrations/20251121_update_garden_items.sql'
];

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: Please set DATABASE_URL environment variable (postgres://user:pass@host:port/db)');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    console.log('Connected to DB, running migrations...');
    
    for (const migration of migrations) {
      const migrationPath = join(__dirname, migration);
      const sql = readFileSync(migrationPath, 'utf8');
      console.log(`\nRunning migration: ${migration}`);
      await client.query(sql);
      console.log(`✅ ${migration} completed`);
    }
    
    console.log('\n✅ All migrations completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exitCode = 2;
  } finally {
    await client.end();
  }
}

run();
