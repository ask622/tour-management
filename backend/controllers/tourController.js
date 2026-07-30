import express from 'express';
import mongoose from 'mongoose';
import Tour from '../models/Tour.js';

const fallbackTours = [
    {
        _id: 'fallback-1',
        title: 'Nainital Lake Tour',
        city: 'Nainital, Uttarakhand',
        address: 'Nainital',
        distance: 300,
        image: '/api/v1/tour-images/tour-img01.jpg',
        description: 'Explore the mesmerizing Naini Lake surrounded by lush green hills and experience boating in the heart of Nainital.',
        price: 1999,
        maxPeople: 10,
        featured: true,
        averageRating: 4.75,
    },
    {
        _id: 'fallback-2',
        title: 'Valley of Flowers Trek',
        city: 'Chamoli, Uttarakhand',
        address: 'Chamoli',
        distance: 500,
        image: '/api/v1/tour-images/tour-img02.jpg',
        description: 'Witness the breathtaking beauty of the Valley of Flowers, a UNESCO World Heritage Site famous for its vibrant meadows.',
        price: 3999,
        maxPeople: 8,
        featured: true,
        averageRating: 4.9,
    },
    {
        _id: 'fallback-3',
        title: 'Auli Snow Adventure',
        city: 'Auli, Uttarakhand',
        address: 'Auli',
        distance: 400,
        image: '/api/v1/tour-images/tour-img03.jpg',
        description: 'Enjoy skiing and cable car rides in Auli, one of India’s top winter destinations with stunning snow-covered peaks.',
        price: 4999,
        maxPeople: 6,
        featured: true,
        averageRating: 4.75,
    },
];

const addBaseUrlToPhoto = (req, tour) => {
    const baseUrl = `${req.protocol}://${req.get('host')}/api/v1`;
    const source = tour && tour._doc ? tour._doc : tour;

    return {
        ...source,
        photo: source.photo ? `${baseUrl}${source.photo}` : '',
        gallery: source.gallery ? source.gallery.map(img => `${baseUrl}${img}`) : [],
    };
};

const getFallbackToursData = (req) => fallbackTours.map(tour => ({
    ...tour,
    photo: tour.image ? `${req.protocol}://${req.get('host')}${tour.image}` : '',
    gallery: [],
}));

const isDatabaseReady = () => mongoose.connection.readyState === 1;

export const createTour = async (req, res) => {
    try {
        const tour = new Tour(req.body);
        const savedTour = await tour.save();
        res.status(201).json({ success: true, message: 'Successfully created', data: addBaseUrlToPhoto(req, savedTour) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create. Try again.', error: err.message });
    }
};

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

export const getSingleTour = async (req, res) => {
    const { id } = req.params;

    if (!isDatabaseReady()) {
        const fallbackTour = getFallbackToursData(req).find(tour => tour._id === id);
        if (fallbackTour) {
            return res.status(200).json({ success: true, message: 'Tour fetched successfully from fallback data', data: fallbackTour });
        }

        return res.status(404).json({ success: false, message: 'Tour not found' });
    }

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

export const getAllTours = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    if (!isDatabaseReady()) {
        const fallbackData = getFallbackToursData(req);
        const startIndex = (page - 1) * limit;
        const paginatedTours = fallbackData.slice(startIndex, startIndex + limit);

        return res.status(200).json({
            success: true,
            count: paginatedTours.length,
            totalPages: Math.ceil(fallbackData.length / limit),
            currentPage: page,
            message: 'Tours fetched successfully from fallback data',
            data: paginatedTours,
        });
    }

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

export const getTourBySearch = async (req, res) => {
    const city = new RegExp(req.query.city, 'i');
    const distance = parseInt(req.query.distance);
    const maxPeople = parseInt(req.query.maxPeople);

    if (!isDatabaseReady()) {
        const fallbackData = getFallbackToursData(req).filter(tour => {
            const matchesCity = !req.query.city || tour.city.match(city);
            const matchesDistance = Number.isNaN(distance) || tour.distance >= distance;
            const matchesPeople = Number.isNaN(maxPeople) || tour.maxPeople >= maxPeople;
            return matchesCity && matchesDistance && matchesPeople;
        });

        return res.status(200).json({
            success: true,
            count: fallbackData.length,
            message: 'Tours fetched successfully from fallback data',
            data: fallbackData,
        });
    }

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

export const getFeaturedTour = async (req, res) => {
    if (!isDatabaseReady()) {
        const fallbackData = getFallbackToursData(req).filter(tour => tour.featured);
        return res.status(200).json({
            success: true,
            message: 'Featured tours fetched successfully from fallback data',
            data: fallbackData,
        });
    }

    try {
        const tours = await Tour.find({ featured: true }).limit(8);

        if (!tours || tours.length === 0) {
            return res.status(404).json({ success: false, message: 'No featured tours found' });
        }

        const updatedTours = tours.map(tour => addBaseUrlToPhoto(req, tour));

        res.status(200).json({
            success: true,
            message: 'Featured tours fetched successfully',
            data: updatedTours,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch featured tours', error: err.message });
    }
};

export const getTourCount = async (req, res) => {
    if (!isDatabaseReady()) {
        return res.status(200).json({
            success: true,
            data: fallbackTours.length,
        });
    }

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
