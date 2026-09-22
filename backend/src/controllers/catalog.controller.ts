import type { Request, Response, NextFunction } from 'express';
import { listInstitutes, getInstituteBySlug, listCourses, getCourseBySlug } from '../operations';

// 5 minutes public cache for catalog data (rarely changes)
const CACHE_HEADER = 'public, max-age=300, stale-while-revalidate=60';

export async function getInstitutes(_req: Request, res: Response, next: NextFunction) {
  try {
    const institutes = await listInstitutes();
    res.set('Cache-Control', CACHE_HEADER);
    res.json({ data: { institutes } });
  } catch (err) {
    next(err);
  }
}

export async function getInstitute(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = typeof req.params.slug === 'string' ? req.params.slug : String(req.params.slug || '');
    const institute = await getInstituteBySlug(slug);
    if (!institute) {
      res.status(404).json({ error: 'Institution not found.' });
      return;
    }
    res.set('Cache-Control', CACHE_HEADER);
    res.json({ data: { institute } });
  } catch (err) {
    next(err);
  }
}

export async function getCourses(req: Request, res: Response, next: NextFunction) {
  try {
    const level = typeof req.query.level === 'string' ? req.query.level : undefined;
    const discipline = typeof req.query.discipline === 'string' ? req.query.discipline : undefined;
    const query = typeof req.query.q === 'string' ? req.query.q : undefined;
    const page = req.query.page ? Math.max(1, parseInt(String(req.query.page), 10) || 1) : undefined;
    const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 50)) : undefined;

    const result = await listCourses({ level, discipline, query, page, limit });
    res.set('Cache-Control', CACHE_HEADER);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function getCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = typeof req.params.slug === 'string' ? req.params.slug : String(req.params.slug || '');
    const course = await getCourseBySlug(slug);
    if (!course) {
      res.status(404).json({ error: 'Programme not found.' });
      return;
    }
    res.set('Cache-Control', CACHE_HEADER);
    res.json({ data: { course } });
  } catch (err) {
    next(err);
  }
}
