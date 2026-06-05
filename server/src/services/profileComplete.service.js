import db from '../config/database.js';

export const calculateProfileComplete = async (candidateId) => {
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
    include: {
      educations: true,
      experiences: true,
      skills: true,
    },
  });

  if (!candidate) return 0;

  let score = 0;

  const hasPersonalInfo =
    candidate.firstName &&
    candidate.lastName &&
    candidate.city &&
    candidate.state &&
    candidate.mobile;
  if (hasPersonalInfo) score += 20;

  if (candidate.educations.length > 0) score += 15;

  if (candidate.isFresher || candidate.experiences.length > 0) score += 15;

  if (candidate.skills.length >= 3) score += 20;

  if (candidate.photoUrl) score += 15;

  if (candidate.resumeUrl) score += 15;

  await db.candidate.update({
    where: { id: candidateId },
    data: { profileComplete: score },
  });

  return score;
};
