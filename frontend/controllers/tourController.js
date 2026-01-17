import express from 'express';
import Tour from '../models/Tour.js';

// Helper function to complete image URLs dynamically
const addBaseUrlToPhoto = (req, tour) => {
    const baseUrl = `${req.protocol}://${req.get('host')}/api/v1`;
    return {
        ...tour._doc,
        photo: tour.photo ? `${baseUrl}${tour.photo}` : '',
        // Future ready: If gallery array is added
        gallery: tour.gallery ? tour.gallery.map(img => `${baseUrl}${img}`) : [],
    };
};

// Create new tour
export const createTour = async (req, res) => {
    try {
        const tour = new Tour(req.body);
        const savedTour = await tour.save();
        res.status(201).json({ success: true, message: 'Successfully created', data: addBaseUrlToPhoto(req, savedTour) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create. Try again.', error: err.message });
    }
};

// Update tour
export const updateTour = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid Tour ID' });
        }

        const updatedTour = await Tour.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedTour) {
            return res.status(404).json({ success: false, message: 'Tour not found' });
        }

        res.status(200).json({ success: true, message: 'Tour updated successfully', data: addBaseUrlToPhoto(req, updatedTour) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update. Try again.', error: err.message });
    }
};

// Delete tour
export const deleteTour = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid Tour ID' });
        }

        const deletedTour = await Tour.findByIdAndDelete(id);

        if (!deletedTour) {
            return res.status(404).json({ success: false, message: 'Tour not found' });
        }

        res.status(200).json({ success: true, message: 'Tour deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete. Try again.', error: err.message });
    }
};

// Get single tour
export const getSingleTour = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid Tour ID' });
        }

        const tour = await Tour.findById(id);

        if (!tour) {
            return res.status(404).json({ success: false, message: 'Tour not found' });
        }

        res.status(200).json({ success: true, message: 'Tour fetched successfully', data: addBaseUrlToPhoto(req, tour) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch. Try again.', error: err.message });
    }
};

// Get all tours with pagination
export const getAllTours = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    try {
        const tours = await Tour.find({})
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Tour.countDocuments();

        const updatedTours = tours.map(tour => addBaseUrlToPhoto(req, tour));

        res.status(200).json({
            success: true,
            count: updatedTours.length,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            message: 'Tours fetched successfully',
            data: updatedTours,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch. Try again.', error: err.message });
    }
};

// Get tour by search
export const getTourBySearch = async (req, res) => {
    const city = new RegExp(req.query.city, 'i'); // Case-insensitive search
    const distance = parseInt(req.query.distance);
    const maxPeople = parseInt(req.query.maxPeople);

    try {
        const tours = await Tour.find({
            city: city,
            distance: { $gte: distance },
            maxPeople: { $gte: maxPeople },
        });

        const updatedTours = tours.map(tour => addBaseUrlToPhoto(req, tour));

        res.status(200).json({
            success: true,
            count: updatedTours.length,
            message: 'Tours fetched successfully',
            data: updatedTours,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch. Try again.', error: err.message });
    }
};

// Get featured tours
export const getFeaturedTour = async (req, res) => {
    try {
        const tours = await Tour.find({ featured: true }).limit(8);

        if (!tours || tours.length === 0) {
            return res.status(404).json({ success: false, message: "No featured tours found" });
        }

        const updatedTours = tours.map(tour => addBaseUrlToPhoto(req, tour));

        res.status(200).json({
            success: true,
            message: "Featured tours fetched successfully",
            data: updatedTours,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Failed to fetch featured tours", error: err.message });
    }
};

// Get tour count
export const getTourCount = async (req, res) => {
    try {
        const tourCount = await Tour.estimatedDocumentCount();
        res.status(200).json({
            success: true,
            data: tourCount,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch. Try again.', error: err.message });
    }
};
