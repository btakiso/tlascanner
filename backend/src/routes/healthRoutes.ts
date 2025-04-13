import { Router } from 'express';
import { Pool } from 'pg';
import db from '../config/database';
import { io } from '../app';
import { getSocketServerStatus } from '../socket';

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

// WebSocket server status endpoint
router.get('/socket', (req, res) => {
    try {
        const socketStatus = getSocketServerStatus(io);
        res.status(200).json(socketStatus);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Error checking WebSocket server status',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
