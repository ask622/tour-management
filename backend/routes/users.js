import express from 'express';
const router = express.Router();

import { deleteUser, updateUser, getAllUsers, getSingleUser, getUserBookings, updateUserStatus } from '../controllers/userController.js';

import { verifyUser, verifyAdmin } from '../utils/verifyToken.js';

router.put('/:id', verifyUser, updateUser);
router.patch('/:id/status', verifyAdmin, updateUserStatus);
router.delete('/:id', verifyAdmin, deleteUser);
router.get('/:id/bookings', verifyAdmin, getUserBookings);
router.get('/:id', verifyUser, getSingleUser);
router.get('/', verifyAdmin, getAllUsers);

export default router;



