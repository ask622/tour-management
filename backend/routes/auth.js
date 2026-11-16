import express from 'express';
import { adminLogin, login, logout, registration, setupAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/registration', registration);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/setup-admin', setupAdmin);
router.post('/logout', logout);


export default router;