import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

// Routes
import tourRoute from './routes/tours.js';
import userRoute from './routes/users.js';
import authRoute from './routes/auth.js';
import bookingRoute from './routes/bookings.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// ================== IMPORTANT FOR ES MODULE ==================
const __dirname = path.resolve();
// =============================================================

// CORS
const corsOptions = {
  origin: true,
  credentials: true,
};

// ================== DATABASE CONNECTION ==================
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

// ================== MIDDLEWARES ==================
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// Static images (already correct)
app.use(
  '/api/v1/tour-images',
  express.static(path.join(__dirname, 'tour-images'))
);

// ================== API ROUTES ==================
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/bookings', bookingRoute);

// ================== REACT FRONTEND SERVE ==================
// ⚠️ frontend folder project root me hona chahiye

app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// React Router fallback (MOST IMPORTANT)
app.get('*', (req, res) => {
  res.sendFile(
    path.join(__dirname, 'frontend', 'build', 'index.html')
  );
});

// ================== ERROR HANDLER ==================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ success: false, message: 'Something went wrong!', error: err.message });
});

// ================== START SERVER ==================
app.listen(port, () => {
  connect();
  console.log('Server listening on port', port);
});
