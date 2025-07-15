import express from 'express';
import { createTour, deleteTour, updateTour ,getAllTours ,getSingleTour, getTourBySearch,getFeaturedTour, getTourCount} from '../controllers/tourController.js';
import { verifyAdmin } from '../utils/verifyToken.js';

const router = express.Router();

//  POST request to create a new tour
router.post('/',createTour);
//  PUT request to update a tour
router.put('/:id', updateTour);
//  DELETE request to delete a tour  
router.delete('/:id',deleteTour);
 //  GET request to get a single tour
 router.get('/:id',getSingleTour);

//  GET request to get all tours
router.get('/', getAllTours);
// get tour by search
router.get("/search/getTourBySearch",getTourBySearch);
//get tour by featured
router.get("/search/getFeaturedTour",getFeaturedTour);
router.get("/search/getTourCount",getTourCount);


export default router;
