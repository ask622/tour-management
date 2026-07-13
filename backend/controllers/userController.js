import express from 'express';
import User from '../models/User.js';

// Create new User
export const createUser = async (req, res) => {
    try {
        const User = new User(req.body);
        const savedUser = await User.save();
        res.status(201).json({ success: true, message: 'Successfully created', data: savedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create. Try again.', error: err.message });
    }
};

// Update User
export const updateUser = async (req, res) => {
    const UserId = req.params.id;
    try {
        const updatedUser = await User.findByIdAndUpdate(UserId, req.body, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update. Try again.', error: err.message });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete. Try again.', error: err.message });
    }
};

// Get single User
export const getSingleUser = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User fetched successfully', data: user });
    } catch (err) {
        res.status(404).json({ success: false, message: 'Failed to fetch. Try again.', error: err.message });
    }
};

// Get all Users
export const getAllUsers = async (req, res) => {
    

    try {
        const user = await User.find({})
           

        res.status(200).json({
            success: true,
           
            message: 'Users fetched successfully',
            data: user
        });
    } catch (err) {
        res.status(404).json({ success: false, message: 'Failed to fetch. Try again.', error: err.message });
    }
};