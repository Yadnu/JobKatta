import { MapPin, Users, Briefcase, Target } from 'lucide-react';

const STATS = [
  { label: 'Cities Covered', value: '50+', icon: MapPin },
  { label: 'Registered Employers', value: '2,000+', icon: Briefcase },
  { label: 'Job Seekers', value: '50,000+', icon: Users },
  { label: 'Jobs Posted', value: '10,000+', icon: Target },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">About Job Katta</h1>
          <p className="mt-3 text-slate-500 text-lg">Apni Naukri, Apne Shehar Mein</p>
        </div>

        {/* Mission */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed">
            Job Katta is India's hyperlocal hiring platform, built to connect local talent with local
            employers. We believe that great opportunities shouldn't require relocating to a metro city.
            Our platform empowers workers in tier-2 and tier-3 cities to find meaningful employment
            close to home, while helping local businesses find skilled candidates from their own
            communities.
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            From daily wage workers and blue-collar professionals to skilled technicians and
            white-collar employees — Job Katta serves every segment of India's diverse workforce.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <Icon className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: 'Local First', desc: 'We prioritise jobs in your city and state, reducing commutes and enabling communities to thrive.' },
              { title: 'Transparency', desc: 'Clear salary ranges, honest job descriptions, and verified employers — no hidden surprises.' },
              { title: 'Inclusivity', desc: 'Supporting freshers, career changers, and experienced professionals equally across all industries.' },
            ].map((v) => (
              <div key={v.title}>
                <h3 className="font-semibold text-slate-700 mb-1">{v.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team placeholder */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">The Team</h2>
          <p className="text-slate-600 leading-relaxed">
            Job Katta was founded by a team of engineers, HR professionals, and entrepreneurs who
            personally experienced the challenges of local hiring in India. We are headquartered in
            Pune, Maharashtra, and operate across India.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Want to join our team?{' '}
            <a href="mailto:careers@jobkatta.in" className="text-blue-600 hover:underline">
              careers@jobkatta.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
