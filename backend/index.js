import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import tourRoute from './routes/tours.js';
import userRoute from './routes/users.js';
import authRoute from './routes/auth.js';
import bookingRoute from './routes/bookings.js';
import adminRoute from './routes/admin.js';
import reviewRoute from './routes/reviews.js';
import catalogRoute from './routes/catalog.js';
import couponRoute from './routes/coupons.js';
import enquiryRoute from './routes/enquiries.js';
import siteContentRoute from './routes/siteContent.js';
import newsletterRoute from './routes/newsletter.js';
import maintenanceMode from './utils/maintenanceMode.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://tour-management-akws.onrender.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
].filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
};

mongoose.set('strictQuery', false);

const connect = async () => {
    if (!process.env.MONGO_URI) {
        console.log('No MONGO_URI provided. Continuing without database connection.');
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('Database connected');
    } catch (err) {
        console.error('Database connection failed. Continuing with fallback tour data:', err.message);
    }
};

connect();

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use('/api/v1/tour-images', express.static(path.join(process.cwd(), 'tour-images')));

app.use(maintenanceMode);
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/admin', adminRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1', catalogRoute);
app.use('/api/v1/coupons', couponRoute);
app.use('/api/v1/enquiries', enquiryRoute);
app.use('/api/v1/site-content', siteContentRoute);
app.use('/api/v1/newsletter', newsletterRoute);
app.use('/api/bookings', bookingRoute);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!', error: err.message });
});

app.listen(port, () => {
    console.log('Server listening on port', port);
});
