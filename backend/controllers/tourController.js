import express from 'express';
import mongoose from 'mongoose';
import Tour from '../models/Tour.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

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
    const resolveImageUrl = (image) => {
        if (!image) return '';
        if (/^https?:\/\//i.test(image)) return image;
        if (image.startsWith('/api/v1/')) return `${req.protocol}://${req.get('host')}${image}`;
        return `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`;
    };

    return {
        ...source,
        photo: resolveImageUrl(source.photo),
        gallery: Array.isArray(source.gallery) ? source.gallery.map(resolveImageUrl) : [],
    };
};

const getFallbackToursData = (req) => fallbackTours.map(tour => ({
    ...tour,
    photo: tour.image ? `${req.protocol}://${req.get('host')}${tour.image}` : '',
    gallery: [],
}));

const isDatabaseReady = () => mongoose.connection.readyState === 1;
const allowedTourFields = [
    'title', 'city', 'address', 'distance', 'image', 'description', 'price', 'maxPeople',
    'featured', 'discountPrice', 'duration', 'availableDates', 'itinerary',
    'includedServices', 'excludedServices', 'gallery', 'status', 'categoryId', 'destinationId',
];

const getTourUpdates = (body) => Object.fromEntries(
    allowedTourFields
        .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
        .map((field) => [field, body[field]])
);

const hasInvalidDiscount = (discountPrice, price) =>
    discountPrice !== undefined && discountPrice !== null &&
    (!Number.isFinite(Number(discountPrice)) || Number(discountPrice) < 0 || Number(discountPrice) >= Number(price));

const getFallbackCatalogFilters = (query, res) => {
    const minPrice = query.minPrice === undefined || query.minPrice === '' ? 0 : Number(query.minPrice);
    const maxPrice = query.maxPrice === undefined || query.maxPrice === '' ? Infinity : Number(query.maxPrice);
    const minRating = query.minRating === undefined || query.minRating === '' ? 0 : Number(query.minRating);
    const travelers = query.travelers === undefined || query.travelers === '' ? undefined : Number(query.travelers);
    const search = String(query.search || '').trim().toLowerCase();
    const duration = String(query.duration || '');
    const date = String(query.date || '');

    if ([minPrice, maxPrice, minRating].some((value) => !Number.isFinite(value) && value !== Infinity) ||
        minPrice < 0 || maxPrice < minPrice || minRating < 0 || minRating > 5) {
        res.status(400).json({ success: false, message: 'Invalid tour filters' });
        return null;
    }
    if (search.length > 120 || (travelers !== undefined && (!Number.isInteger(travelers) || travelers < 1 || travelers > 100)) ||
        (duration && !['short', 'week', 'long'].includes(duration))) {
        res.status(400).json({ success: false, message: 'Invalid search, traveler count, or duration filter' });
        return null;
    }
    if (query.categoryId && !mongoose.isValidObjectId(query.categoryId)) {
        res.status(400).json({ success: false, message: 'Invalid category ID' });
        return null;
    }
    if (query.destinationId && !mongoose.isValidObjectId(query.destinationId)) {
        res.status(400).json({ success: false, message: 'Invalid destination ID' });
        return null;
    }
    if (date) {
        const parsedDate = new Date(`${date}T00:00:00.000Z`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date) {
            res.status(400).json({ success: false, message: 'Choose a valid travel date' });
            return null;
        }
    }

    return { minPrice, maxPrice, minRating, travelers, search, duration, date };
};

const matchesFallbackTour = (tour, filters) => {
    const durationDays = Number(String(tour.duration || '').match(/\d+/)?.[0]);
    const matchesDuration = !filters.duration ||
        (filters.duration === 'short' && durationDays >= 1 && durationDays <= 3) ||
        (filters.duration === 'week' && durationDays >= 4 && durationDays <= 7) ||
        (filters.duration === 'long' && durationDays >= 8);
    const availableDates = Array.isArray(tour.availableDates) ? tour.availableDates : [];
    const matchesDate = !filters.date || availableDates.length === 0 ||
        availableDates.some((date) => new Date(date).toISOString().slice(0, 10) === filters.date);
    return matchesDuration && matchesDate &&
        (!filters.search || `${tour.title} ${tour.city}`.toLowerCase().includes(filters.search)) &&
        Number(tour.discountPrice ?? tour.price) >= filters.minPrice && Number(tour.discountPrice ?? tour.price) <= filters.maxPrice &&
        Number(tour.averageRating || 0) >= filters.minRating &&
        (filters.travelers === undefined || Number(tour.maxPeople) >= filters.travelers);
};

const getCatalogFilters = async (req, res) => {
    const filter = req.adminView ? {} : { status: { $ne: 'inactive' } };
    const searchTerm = String(req.query.search || '').trim();
    const minPrice = req.query.minPrice === undefined || req.query.minPrice === '' ? undefined : Number(req.query.minPrice);
    const maxPrice = req.query.maxPrice === undefined || req.query.maxPrice === '' ? undefined : Number(req.query.maxPrice);
    const minRating = req.query.minRating === undefined || req.query.minRating === '' ? 0 : Number(req.query.minRating);
    const duration = String(req.query.duration || '');
    const sort = String(req.query.sort || 'popular');
    const travelers = req.query.travelers === undefined || req.query.travelers === '' ? undefined : Number(req.query.travelers);
    const travelDate = String(req.query.date || '');

    if (searchTerm.length > 120) {
        res.status(400).json({ success: false, message: 'Search must be 120 characters or fewer' });
        return null;
    }

    if ((minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) ||
        (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0))) {
        res.status(400).json({ success: false, message: 'Price filters must be non-negative numbers' });
        return null;
    }
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
        res.status(400).json({ success: false, message: 'Minimum price cannot exceed maximum price' });
        return null;
    }
    if (!Number.isFinite(minRating) || minRating < 0 || minRating > 5) {
        res.status(400).json({ success: false, message: 'Minimum rating must be between 0 and 5' });
        return null;
    }
    if (duration && !['short', 'week', 'long'].includes(duration)) {
        res.status(400).json({ success: false, message: 'Invalid duration filter' });
        return null;
    }
    if (!['popular', 'price-asc', 'price-desc', 'rating'].includes(sort)) {
        res.status(400).json({ success: false, message: 'Invalid tour sort option' });
        return null;
    }
    if (travelers !== undefined && (!Number.isInteger(travelers) || travelers < 1 || travelers > 100)) {
        res.status(400).json({ success: false, message: 'Traveler count must be between 1 and 100' });
        return null;
    }
    if (travelDate) {
        const dateStart = new Date(`${travelDate}T00:00:00.000Z`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate) || Number.isNaN(dateStart.getTime()) || dateStart.toISOString().slice(0, 10) !== travelDate) {
            res.status(400).json({ success: false, message: 'Choose a valid travel date' });
            return null;
        }
    }

    if (req.query.categoryId && !mongoose.isValidObjectId(req.query.categoryId)) {
        res.status(400).json({ success: false, message: 'Invalid category ID' });
        return null;
    }
    if (req.query.destinationId && !mongoose.isValidObjectId(req.query.destinationId)) {
        res.status(400).json({ success: false, message: 'Invalid destination ID' });
        return null;
    }
    if (req.query.categoryId) filter.categoryId = new mongoose.Types.ObjectId(req.query.categoryId);
    if (req.query.destinationId) filter.destinationId = new mongoose.Types.ObjectId(req.query.destinationId);
    if (searchTerm) {
        const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.$or = [
            { title: { $regex: escapedSearch, $options: 'i' } },
            { city: { $regex: escapedSearch, $options: 'i' } },
        ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
        const effectivePrice = { $ifNull: ['$discountPrice', '$price'] };
        const priceConditions = [];
        if (minPrice !== undefined) priceConditions.push({ $gte: [effectivePrice, minPrice] });
        if (maxPrice !== undefined) priceConditions.push({ $lte: [effectivePrice, maxPrice] });
        filter.$expr = { $and: priceConditions };
    }
    if (duration === 'short') filter.duration = { $regex: '\\b[1-3]\\s*days?\\b', $options: 'i' };
    if (duration === 'week') filter.duration = { $regex: '\\b[4-7]\\s*days?\\b', $options: 'i' };
    if (duration === 'long') filter.duration = { $regex: '\\b(?:[89]|[1-9][0-9]+)\\s*days?\\b', $options: 'i' };
    if (travelers !== undefined) filter.maxPeople = { $gte: travelers };
    if (travelDate) {
        const dateStart = new Date(`${travelDate}T00:00:00.000Z`);
        const nextDay = new Date(dateStart);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        filter.$and = [{
            $or: [
                { availableDates: { $size: 0 } },
                { availableDates: { $gte: dateStart, $lt: nextDay } },
            ],
        }];
    }

    if (minRating > 0) {
        const qualifiedRatings = await Review.aggregate([
            { $match: { isApproved: true, isHidden: { $ne: true } } },
            { $group: { _id: '$productId', averageRating: { $avg: '$rating' } } },
            { $match: { averageRating: { $gte: minRating } } },
            { $project: { _id: 1 } },
        ]);
        filter._id = { $in: qualifiedRatings.map((item) => item._id) };
    }

    return { filter, minRating, sort };
};

const getRatingSummaries = async (tourIds) => {
    if (!tourIds.length) return new Map();
    const summaries = await Review.aggregate([
        { $match: { productId: { $in: tourIds }, isApproved: true, isHidden: { $ne: true } } },
        {
            $group: {
                _id: '$productId',
                averageRating: { $avg: '$rating' },
                ratingCount: { $sum: 1 },
            },
        },
    ]);
    return new Map(summaries.map(({ _id, averageRating, ratingCount }) => [
        String(_id),
        { averageRating: Number(averageRating.toFixed(1)), ratingCount },
    ]));
};

export const createTour = async (req, res) => {
    try {
        const updates = getTourUpdates(req.body);
        if (hasInvalidDiscount(updates.discountPrice, updates.price)) {
            return res.status(400).json({ success: false, message: 'Discount price must be lower than the regular price' });
        }
        const tour = new Tour(updates);
        const savedTour = await tour.save();
        res.status(201).json({ success: true, message: 'Successfully created', data: addBaseUrlToPhoto(req, savedTour) });
    } catch (err) {
        const status = err.name === 'ValidationError' || err.code === 11000 ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

export const updateTour = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid Tour ID' });
        }

        const updates = getTourUpdates(req.body);
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid tour fields were provided' });
        }
        if (Object.prototype.hasOwnProperty.call(updates, 'discountPrice')) {
            const currentTour = await Tour.findById(id).select('price');
            if (!currentTour) return res.status(404).json({ success: false, message: 'Tour not found' });
            const price = Object.prototype.hasOwnProperty.call(updates, 'price') ? updates.price : currentTour.price;
            if (hasInvalidDiscount(updates.discountPrice, price)) {
                return res.status(400).json({ success: false, message: 'Discount price must be lower than the regular price' });
            }
        }

        const updatedTour = await Tour.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!updatedTour) {
            return res.status(404).json({ success: false, message: 'Tour not found' });
        }

        res.status(200).json({ success: true, message: 'Tour updated successfully', data: addBaseUrlToPhoto(req, updatedTour) });
    } catch (err) {
        const status = err.name === 'ValidationError' || err.code === 11000 ? 400 : 500;
        res.status(status).json({ success: false, message: err.message });
    }
};

export const deleteTour = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid Tour ID' });
        }

        const hasBookings = await Booking.exists({ tourId: id });
        if (hasBookings) {
            return res.status(409).json({
                success: false,
                message: 'This tour has booking history and cannot be deleted. Keep it available for existing records.',
            });
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

        const tour = await Tour.findById(id)
            .populate('categoryId', 'name slug')
            .populate('destinationId', 'name slug region country');

        if (!tour) {
            return res.status(404).json({ success: false, message: 'Tour not found' });
        }
        if (tour.status === 'inactive') {
            return res.status(404).json({ success: false, message: 'Tour not found' });
        }

        res.status(200).json({ success: true, message: 'Tour fetched successfully', data: addBaseUrlToPhoto(req, tour) });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch. Try again.', error: err.message });
    }
};

export const getAllTours = async (req, res) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 8));
    const requestedSort = String(req.query.sort || 'popular');
    const fallbackSorts = ['popular', 'price-asc', 'price-desc', 'rating'];
    if (!fallbackSorts.includes(requestedSort)) {
        return res.status(400).json({ success: false, message: 'Invalid tour sort option' });
    }

    try {
        if (!isDatabaseReady()) {
            const fallbackFilters = getFallbackCatalogFilters(req.query, res);
            if (!fallbackFilters) return;
            const fallbackData = getFallbackToursData(req).filter((tour) =>
                (!req.query.categoryId || String(tour.categoryId) === String(req.query.categoryId)) &&
                (!req.query.destinationId || String(tour.destinationId) === String(req.query.destinationId)) &&
                matchesFallbackTour(tour, fallbackFilters)
            );
            if (requestedSort === 'price-asc') fallbackData.sort((a, b) => a.price - b.price);
            if (requestedSort === 'price-desc') fallbackData.sort((a, b) => b.price - a.price);
            if (requestedSort === 'rating') fallbackData.sort((a, b) => b.averageRating - a.averageRating);
            if (requestedSort === 'popular') fallbackData.sort((a, b) => Number(b.featured) - Number(a.featured));
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

        const catalog = await getCatalogFilters(req, res);
        if (!catalog) return;
        const { filter, sort } = catalog;
        const total = await Tour.countDocuments(filter);
        let tours;
        if (sort === 'rating') {
            const allTours = await Tour.find(filter)
                .populate('categoryId', 'name slug')
                .populate('destinationId', 'name slug region country');
            const summaries = await getRatingSummaries(allTours.map((tour) => tour._id));
            allTours.sort((first, second) =>
                (summaries.get(String(second._id))?.averageRating || 0) -
                (summaries.get(String(first._id))?.averageRating || 0)
            );
            tours = allTours.slice((page - 1) * limit, page * limit);
            tours = tours.map((tour) => ({
                ...addBaseUrlToPhoto(req, tour),
                ...(summaries.get(String(tour._id)) || { averageRating: 0, ratingCount: 0 }),
            }));
        } else {
            let results;
            if (sort === 'price-asc' || sort === 'price-desc') {
                const aggregationResults = await Tour.aggregate([
                    { $match: filter },
                    { $addFields: { effectivePrice: { $ifNull: ['$discountPrice', '$price'] } } },
                    { $sort: { effectivePrice: sort === 'price-asc' ? 1 : -1, _id: 1 } },
                    { $skip: (page - 1) * limit },
                    { $limit: limit },
                ]);
                const populated = await Tour.populate(aggregationResults, [
                    { path: 'categoryId', select: 'name slug' },
                    { path: 'destinationId', select: 'name slug region country' },
                ]);
                results = populated.map(({ effectivePrice, ...tour }) => tour);
            } else {
                results = await Tour.find(filter)
                    .populate('categoryId', 'name slug')
                    .populate('destinationId', 'name slug region country')
                    .sort({ featured: -1, createdAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit);
            }
            const summaries = await getRatingSummaries(results.map((tour) => tour._id));
            tours = results.map((tour) => ({
                ...addBaseUrlToPhoto(req, tour),
                ...(summaries.get(String(tour._id)) || { averageRating: 0, ratingCount: 0 }),
            }));
        }

        res.status(200).json({
            success: true,
            count: tours.length,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            message: 'Tours fetched successfully',
            data: tours,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch. Try again.', error: err.message });
    }
};

const parseQueryNumber = (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
};

export const getTourBySearch = async (req, res) => {
    const searchTerm = String(req.query.searchTerm || req.query.city || req.query.search || '').trim();
    if (searchTerm.length > 120) {
        return res.status(400).json({ success: false, message: 'Search must be 120 characters or fewer' });
    }
    const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = searchTerm ? new RegExp(escapedSearch, 'i') : null;
    const distance = parseQueryNumber(req.query.distance);
    const maxPeople = parseQueryNumber(req.query.maxPeople);

    const matchesSearch = (tour) => {
        if (!searchTerm) return true;
        return Boolean(
            tour.title?.match(searchRegex) ||
            tour.city?.match(searchRegex)
        );
    };

    if (!isDatabaseReady()) {
        const fallbackData = getFallbackToursData(req).filter(tour => {
            const matchesDistance = distance === undefined || tour.distance >= distance;
            const matchesPeople = maxPeople === undefined || tour.maxPeople >= maxPeople;
            return matchesSearch(tour) && matchesDistance && matchesPeople;
        });

        return res.status(200).json({
            success: true,
            count: fallbackData.length,
            message: 'Tours fetched successfully from fallback data',
            data: fallbackData,
        });
    }

    try {
        const filters = { status: { $ne: 'inactive' } };

        if (searchTerm) {
            filters.$or = [
                { title: { $regex: escapedSearch, $options: 'i' } },
                { city: { $regex: escapedSearch, $options: 'i' } },
            ];
        }

        if (distance !== undefined) {
            filters.distance = { $gte: distance };
        }

        if (maxPeople !== undefined) {
            filters.maxPeople = { $gte: maxPeople };
        }

        const tours = await Tour.find(filters)
            .populate('categoryId', 'name slug')
            .populate('destinationId', 'name slug region country');

        const summaries = await getRatingSummaries(tours.map((tour) => tour._id));
        const updatedTours = tours.map((tour) => ({
            ...addBaseUrlToPhoto(req, tour),
            ...(summaries.get(String(tour._id)) || { averageRating: 0, ratingCount: 0 }),
        }));

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
        const tours = await Tour.find({ featured: true, status: { $ne: 'inactive' } })
            .populate('categoryId', 'name slug')
            .populate('destinationId', 'name slug region country')
            .limit(8);

        if (!tours || tours.length === 0) {
            return res.status(404).json({ success: false, message: 'No featured tours found' });
        }

        const summaries = await getRatingSummaries(tours.map((tour) => tour._id));
        const updatedTours = tours.map((tour) => ({
            ...addBaseUrlToPhoto(req, tour),
            ...(summaries.get(String(tour._id)) || { averageRating: 0, ratingCount: 0 }),
        }));

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
        const fallbackFilters = getFallbackCatalogFilters(req.query, res);
        if (!fallbackFilters) return;
        const count = fallbackTours.filter((tour) =>
            (!req.query.categoryId || String(tour.categoryId) === String(req.query.categoryId)) &&
            (!req.query.destinationId || String(tour.destinationId) === String(req.query.destinationId)) &&
            matchesFallbackTour(tour, fallbackFilters)
        ).length;
        return res.status(200).json({
            success: true,
            data: count,
        });
    }

    try {
        const catalog = await getCatalogFilters(req, res);
        if (!catalog) return;
        const tourCount = await Tour.countDocuments(catalog.filter);
        res.status(200).json({
            success: true,
            data: tourCount,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch. Try again.', error: err.message });
    }
};
