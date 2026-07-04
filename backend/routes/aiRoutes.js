import express from 'express';
import { askAssistant } from '../controllers/aiController.js';

const router = express.Router();

router.post('/assistant', askAssistant);

export default router;
