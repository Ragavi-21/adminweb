import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Client, Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
};

const databaseName = process.env.PGDATABASE || 'admin_db';

let pool;

export async function initializeDatabase() {
  console.log('🔄 Checking PostgreSQL connection and database...');

  const tempClient = new Client({ ...dbConfig, database: 'postgres' });

  try {
    await tempClient.connect();

    const res = await tempClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [databaseName]
    );

    if (res.rowCount === 0) {
      console.log(`🔨 Database "${databaseName}" not found. Creating database...`);
      await tempClient.query(`CREATE DATABASE "${databaseName}"`);
      console.log(`✅ Database "${databaseName}" created successfully.`);
    } else {
      console.log(`✅ Database "${databaseName}" already exists.`);
    }
  } catch (error) {
    console.error('❌ Error verifying/creating database:', error.message);
    console.error('💡 Please verify that PostgreSQL is running and credentials in backend/.env are correct.');
    throw error;
  } finally {
    await tempClient.end();
  }

  pool = new Pool({ ...dbConfig, database: databaseName });

  try {
    const client = await pool.connect();
    console.log(`🔌 Connected to database "${databaseName}" pool.`);
    client.release();
  } catch (error) {
    console.error(`❌ Failed to connect to database "${databaseName}" pool:`, error.message);
    throw error;
  }

  try {
    console.log('🔄 Loading database schema from schema.sql...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schemaSql);
    console.log('✅ Tables ready (admin_users, pages)');
  } catch (error) {
    console.error('❌ Error executing database schema:', error.message);
    throw error;
  }
}

export const query = (text, params) => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool.query(text, params);
};
