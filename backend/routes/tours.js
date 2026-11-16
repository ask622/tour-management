import express from 'express';
import { createTour, deleteTour, updateTour ,getAllTours ,getSingleTour, getTourBySearch,getFeaturedTour, getTourCount} from '../controllers/tourController.js';
import { verifyAdmin } from '../utils/verifyToken.js';


const router = express.Router();

router.post('/', verifyAdmin, createTour);
router.put('/:id', verifyAdmin, updateTour);
router.delete('/:id', verifyAdmin, deleteTour);
router.get('/admin/all', verifyAdmin, (req, res, next) => {
    req.adminView = true;
    return getAllTours(req, res, next);
});
router.get('/search/getTourBySearch', getTourBySearch);
router.get('/search/getFeaturedTour', getFeaturedTour);
router.get('/search/getTourCount', getTourCount);
router.get('/', getAllTours);
router.get('/:id', getSingleTour);


export default router;
