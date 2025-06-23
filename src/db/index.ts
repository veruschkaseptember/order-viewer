import { config } from 'dotenv'

// Load environment variables from .env.local only
config({ path: '.env.local' })

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Debug environment variables
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Environment validation
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });

const database = drizzle(client, { schema, logger: true });

export default database;