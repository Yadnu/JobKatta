import db from '../config/database.js';
import { catchAsync } from '../middleware/errorHandler.middleware.js';

export const listSkills = catchAsync(async (_req, res) => {
  const skills = await db.skill.findMany({ orderBy: { name: 'asc' } });
  res.json({ success: true, message: 'Skills fetched', data: skills });
});

export const listCategories = catchAsync(async (_req, res) => {
  const results = await db.skill.findMany({
    select: { category: true },
    distinct: ['category'],
    where: { category: { not: null } },
    orderBy: { category: 'asc' },
  });
  const categories = results.map((r) => r.category);
  res.json({ success: true, message: 'Categories fetched', data: categories });
});
