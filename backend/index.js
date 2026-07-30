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

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;
const corsOptions = {
    origin: true,
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

app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/bookings', bookingRoute);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!', error: err.message });
});

app.listen(port, () => {
    console.log('Server listening on port', port);
});
