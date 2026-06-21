export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: June 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          {[
            {
              title: '1. Information We Collect',
              body: `We collect information you provide directly to us when you create an account, complete your profile, apply for jobs, or contact us. This includes your name, email address, phone number, location, resume, work history, and education details.

We also collect information automatically when you use our services, such as log data, device information, IP address, and cookies to improve your experience.`,
            },
            {
              title: '2. How We Use Your Information',
              body: `We use the information we collect to:
• Match you with relevant job opportunities
• Allow employers to discover your profile (only if you've set it to visible)
• Send job alerts and notifications based on your preferences
• Improve and personalise your experience on Job Katta
• Communicate with you about your account or our services
• Comply with legal obligations`,
            },
            {
              title: '3. Information Sharing',
              body: `We do not sell your personal information. We share your information only in the following circumstances:
• With employers: when you apply for a job or unlock your profile for a specific employer
• With service providers: who help us operate our platform (payment processing, email delivery, hosting)
• As required by law: when legally obligated to do so`,
            },
            {
              title: '4. Data Security',
              body: `We implement industry-standard security measures including HTTPS encryption, hashed passwords, and access controls to protect your personal data. However, no method of transmission over the internet is 100% secure.`,
            },
            {
              title: '5. Your Rights',
              body: `You have the right to:
• Access the personal data we hold about you
• Correct inaccurate information
• Delete your account and associated data
• Opt out of marketing communications
• Export your data

To exercise these rights, contact us at privacy@jobkatta.in`,
            },
            {
              title: '6. Cookies',
              body: `We use cookies to keep you logged in, remember your preferences, and understand how you use our platform. You can disable cookies in your browser settings, but some features may not work correctly.`,
            },
            {
              title: '7. Children\'s Privacy',
              body: `Job Katta is not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors.`,
            },
            {
              title: '8. Changes to This Policy',
              body: `We may update this privacy policy from time to time. We will notify you of significant changes by email or through a notice on our platform.`,
            },
            {
              title: '9. Contact',
              body: `For privacy-related inquiries, contact us at privacy@jobkatta.in or write to: Job Katta, Pune, Maharashtra, India.`,
            },
          ].map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-lg font-semibold text-slate-800 mb-2">{title}</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
