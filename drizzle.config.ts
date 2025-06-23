import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env.local explicitly for Drizzle CLI
dotenv.config({ path: '.env.local' });

export default defineConfig({
    out: './src/db/drizzle',
    schema: './src/db/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    schemaFilter: ['public'],
    introspect: {
        casing: 'preserve',
    },
    casing: 'snake_case',
    verbose: true,
});
