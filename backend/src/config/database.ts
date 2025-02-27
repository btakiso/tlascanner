import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
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

    // Error handling for the pool
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      process.exit(-1);
    });

    // Graceful shutdown
    process.on('SIGINT', this.cleanup.bind(this));
    process.on('SIGTERM', this.cleanup.bind(this));
  }

  private async cleanup(): Promise<void> {
    console.log('Closing database pool...');
    try {
      await this.pool.end();
      console.log('Database pool closed successfully');
    } catch (err) {
      console.error('Error closing database pool:', err);
    }
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  /**
   * Execute a database query
   * @param text The SQL query text
   * @param params Optional array of parameter values
   * @returns Promise resolving to the query result
   * @throws APIError if the query fails
   */
  public async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    const start = Date.now();
    
    try {
      const result = await client.query<T>(text, params);
      const duration = Date.now() - start;
      
      // Log query details in development
      if (process.env.NODE_ENV === 'development') {
        console.log({
          query: text,
          params,
          duration,
          rows: result.rowCount
        });
      }

      return result;
    } catch (err) {
      // Log the error details
      console.error('Database query error:', {
        query: text,
        params,
        error: err
      });

      // Convert database errors to APIError
      throw new APIError(
        'Database error occurred',
        500,
        err instanceof Error ? err.message : 'Unknown error'
      );
    } finally {
      client.release();
    }
  }

  /**
   * Check database connectivity
   * @returns Promise resolving to true if database is connected
   * @throws APIError if database connection fails
   */
  public async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (err) {
      throw new APIError(
        'Database health check failed',
        503,
        err instanceof Error ? err.message : 'Unknown error'
      );
    }
  }
}

// Export a singleton instance
export default Database.getInstance();
