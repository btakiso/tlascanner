import db from '../config/database';
import { URLScanResult } from '../types/urlScan';

export interface URLScanRecord {
  id: number;
  url: string;
  scanId: string;
  results: URLScanResult;
  createdAt: string;
}

export class URLScanModel {
  constructor() {
    this.createTable().catch(console.error);
  }

  async createTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS url_scans (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        scan_id TEXT NOT NULL,
        results JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await db.query(query);
      console.log('URL scans table created or already exists');
    } catch (error) {
      console.error('Error creating URL scans table:', error);
      throw error;
    }
  }

  async saveScan(url: string, scanId: string, results: URLScanResult): Promise<void> {
    const query = `
      INSERT INTO url_scans (url, scan_id, results)
      VALUES ($1, $2, $3)
    `;
    
    try {
      await db.query(query, [url, scanId, JSON.stringify(results)]);
    } catch (error) {
      console.error('Error saving scan:', error);
      throw error;
    }
  }

  async findRecentScan(url: string): Promise<URLScanRecord | null> {
    const query = `
      SELECT id, url, scan_id as "scanId", results, created_at as "createdAt"
      FROM url_scans
      WHERE url = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    try {
      const result = await db.query(query, [url]);
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        ...row,
        results: typeof row.results === 'string' ? JSON.parse(row.results) : row.results
      };
    } catch (error) {
      console.error('Error finding recent scan:', error);
      throw error;
    }
  }

  async findLastScan(): Promise<URLScanRecord | null> {
    const query = `
      SELECT id, url, scan_id as "scanId", results, created_at as "createdAt"
      FROM url_scans
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    try {
      const result = await db.query(query);
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        ...row,
        results: typeof row.results === 'string' ? JSON.parse(row.results) : row.results
      };
    } catch (error) {
      console.error('Error finding last scan:', error);
      throw error;
    }
  }

  async findByScanId(scanId: string): Promise<URLScanRecord | null> {
    const query = `
      SELECT id, url, scan_id as "scanId", results, created_at as "createdAt"
      FROM url_scans
      WHERE scan_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    try {
      const result = await db.query(query, [scanId]);
      if (result.rows.length === 0) {
        return null;
      }
      
      const row = result.rows[0];
      return {
        ...row,
        results: typeof row.results === 'string' ? JSON.parse(row.results) : row.results
      };
    } catch (error) {
      console.error('Error finding scan by ID:', error);
      throw error;
    }
  }
}
