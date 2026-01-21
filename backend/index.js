import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path'; // <-- ADD THIS

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
}

// Database connection
mongoose.set('strictQuery', false);
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Database connected');
    } catch (err) {
        console.error('Error in connecting database:', err.message);
        process.exit(1);
    }
};

// Middlewares
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// STATIC FILE SERVING (IMPORTANT)
app.use('/api/v1/tour-images', express.static(path.join(process.cwd(), 'tour-images')));

// Routes
app.use("/api/v1/tours", tourRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/bookings", bookingRoute);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!", error: err.message });
});

// Start Server
app.listen(port, () => {
    connect();
    console.log('Server listening on port', port);
});
