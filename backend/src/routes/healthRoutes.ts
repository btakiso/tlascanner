import { Router } from 'express';
import { Pool } from 'pg';
import db from '../config/database';

const router = Router();
const pool: Pool = db.getPool();

router.get('/', async (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now()
    };

    try {
        // Check database connection
        await pool.query('SELECT 1');
        healthcheck.message = 'OK';
        res.status(200).json(healthcheck);
    } catch (error) {
        healthcheck.message = error instanceof Error ? error.message : 'Error';
        res.status(503).json(healthcheck);
    }
});

export default router;
