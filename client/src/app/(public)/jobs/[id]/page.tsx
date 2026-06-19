import type { Metadata } from 'next';
import JobDetailClient from './JobDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchJob(id: string) {
  try {
    const res = await fetch(`${API_URL}/jobs/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchJob(id);
  if (!job) return { title: 'Job Not Found | Job Katta' };

  const location = job.isRemote ? 'Remote' : [job.city, job.state].filter(Boolean).join(', ');
  const description = `${job.employer?.companyName} is hiring a ${job.title} in ${location}. ${job.description?.slice(0, 140)}…`;

  return {
    title: `${job.title} at ${job.employer?.companyName} | Job Katta`,
    description,
    openGraph: {
      title: `${job.title} — ${job.employer?.companyName}`,
      description,
      images: job.employer?.logoUrl ? [job.employer.logoUrl] : [],
      type: 'website',
    },
  };
}

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobDetailClient id={id} />;
}
