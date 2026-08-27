import type { Request, Response, NextFunction } from 'express';
import { listInstitutes, getInstituteBySlug, listCourses, getCourseBySlug } from '@draa/database';

export async function getInstitutes(_req: Request, res: Response, next: NextFunction) {
  try {
    const institutes = await listInstitutes();
    res.json({ data: { institutes } });
  } catch (err) {
    next(err);
  }
}

export async function getInstitute(req: Request, res: Response, next: NextFunction) {
  try {
    const institute = await getInstituteBySlug(req.params.slug);
    if (!institute) {
      res.status(404).json({ error: 'Institution not found.' });
      return;
    }
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

    const courses = await listCourses({ level, discipline, query });
    res.json({ data: { courses } });
  } catch (err) {
    next(err);
  }
}

export async function getCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const course = await getCourseBySlug(req.params.slug);
    if (!course) {
      res.status(404).json({ error: 'Programme not found.' });
      return;
    }
    res.json({ data: { course } });
  } catch (err) {
    next(err);
  }
}
