import { Router } from 'express';
import { getInstitutes, getInstitute, getCourses, getCourse } from '../controllers/catalog.controller';

const router = Router();

router.get('/institutes', getInstitutes);
router.get('/institutes/:slug', getInstitute);
router.get('/courses', getCourses);
router.get('/courses/:slug', getCourse);

export default router;
