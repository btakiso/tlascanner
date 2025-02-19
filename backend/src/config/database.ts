import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import { APIError } from '../types/errors';

dotenv.config();

class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    const config: PoolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : undefined,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    };

    this.pool = new Pool(config);

    // Error handling
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async query(text: string, params?: any[]) {
    const client = await this.pool.connect();
    try {
      const start = Date.now();
      const result = await client.query(text, params);
      const duration = Date.now() - start;
      
      console.log({
        query: text,
        params,
        duration,
        rows: result.rowCount
      });

      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw new APIError('Database query failed', 500);
    } finally {
      client.release();
    }
  }

  public async checkConnection(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection error:', error);
      throw new APIError('Database connection failed', 500);
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

// Export a singleton instance
export default Database.getInstance();
