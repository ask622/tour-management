import express from 'express';
const router = express.Router();

import { deleteUser, updateUser, getAllUsers, getSingleUser } from '../controllers/userController.js';

import { verifyUser, verifyAdmin } from '../utils/verifyToken.js';

//update user
router.put('/:id',verifyUser, updateUser);
//delete user
router.delete('/:id',verifyUser, deleteUser);

//get single user
router.get('/:id',verifyUser, getSingleUser);
//get all users

router.get('/',  verifyAdmin,getAllUsers);

export default router;



