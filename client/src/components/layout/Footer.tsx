import Link from 'next/link';
import { Briefcase, Mail, Phone } from 'lucide-react';

const links = {
  'For Candidates': [
    { label: 'Browse Jobs', href: '/jobs' },
    { label: 'Create Profile', href: '/auth/register' },
    { label: 'Premium Plan', href: '/pricing' },
  ],
  'For Employers': [
    { label: 'Post a Job', href: '/employer/jobs/new' },
    { label: 'View Plans', href: '/pricing' },
    { label: 'Employer Login', href: '/auth/login' },
  ],
  'Company': [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span className="font-heading font-bold text-xl text-white">Job Katta</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Apni Naukri, Apne Shehar Mein. India&apos;s hyperlocal hiring platform connecting local talent with local opportunities.
            </p>
            <div className="space-y-2 text-sm">
              <a href="mailto:support@jobkatta.in" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Mail className="h-4 w-4" /> support@jobkatta.in
              </a>
              <a href="tel:+918888888888" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                <Phone className="h-4 w-4" /> +91 88888 88888
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-heading font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-slate-400 hover:text-primary-400 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Job Katta. All rights reserved.</p>
          <p>Made with ❤️ for Bharat</p>
        </div>
      </div>
    </footer>
  );
}
