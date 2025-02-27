import { Router } from 'express';
import { CVEController } from '../controllers/cveController';

const router = Router();
const cveController = new CVEController();

// Search CVEs
router.get('/search', (req, res) => cveController.searchCVEs(req, res));

// Get CVE by ID
router.get('/:cveId', (req, res) => cveController.getCVEById(req, res));

export default router;
