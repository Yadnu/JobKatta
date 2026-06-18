import type { Metadata } from 'next';
import CompanyDetailClient from './CompanyDetailClient';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchEmployer(id: string) {
  try {
    const res = await fetch(`${API_URL}/employer/public/${id}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const employer = await fetchEmployer(id);
  if (!employer) return { title: 'Company Not Found | Job Katta' };

  const location = [employer.city, employer.state].filter(Boolean).join(', ');
  const description = `${employer.companyName} is ${employer.industry ? `a ${employer.industry} company` : 'a company'} based in ${location}. ${employer.description?.slice(0, 120) ?? ''}`;

  return {
    title: `${employer.companyName} Jobs | Job Katta`,
    description,
    openGraph: {
      title: `${employer.companyName} — Jobs & Company Profile`,
      description,
      images: employer.logoUrl ? [employer.logoUrl] : [],
      type: 'website',
    },
  };
}

export default async function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CompanyDetailClient id={id} />;
}
