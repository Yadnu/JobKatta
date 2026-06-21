export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-10">Last updated: June 2026</p>

        <div className="prose prose-slate max-w-none space-y-8">
          {[
            {
              title: '1. Acceptance of Terms',
              body: `By accessing or using Job Katta ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.`,
            },
            {
              title: '2. Eligibility',
              body: `You must be at least 18 years of age to use Job Katta. By using the Platform, you represent that you meet this requirement and that all information you provide is accurate.`,
            },
            {
              title: '3. User Accounts',
              body: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately at support@jobkatta.in if you suspect unauthorised access.`,
            },
            {
              title: '4. Candidate Terms',
              body: `As a candidate, you agree to:
• Provide accurate and truthful profile information
• Not apply to jobs you are not qualified for with fraudulent credentials
• Not misuse the platform to scrape or harvest data
• Respect the application limits associated with your plan`,
            },
            {
              title: '5. Employer Terms',
              body: `As an employer, you agree to:
• Post only genuine job openings at your organisation
• Not post misleading, discriminatory, or illegal job listings
• Treat candidate data confidentially and in accordance with applicable law
• Comply with all applicable Indian labour laws in your hiring practices`,
            },
            {
              title: '6. Prohibited Conduct',
              body: `You must not:
• Post false, misleading, or fraudulent content
• Harass, threaten, or abuse other users
• Attempt to reverse-engineer, hack, or disrupt the Platform
• Use the Platform for unsolicited advertising or spam
• Violate any applicable local, state, national, or international law`,
            },
            {
              title: '7. Payments and Subscriptions',
              body: `Paid plans are billed in advance and are non-refundable except as required by law. Payments are processed securely by Razorpay. Prices are subject to change with 30 days' notice.`,
            },
            {
              title: '8. Content Ownership',
              body: `You retain ownership of the content you submit (resume, profile, job descriptions). By submitting content, you grant Job Katta a non-exclusive, royalty-free licence to use it to operate and improve the Platform.`,
            },
            {
              title: '9. Limitation of Liability',
              body: `Job Katta is a platform that connects job seekers and employers. We do not guarantee employment or successful hiring outcomes. To the maximum extent permitted by law, Job Katta shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.`,
            },
            {
              title: '10. Termination',
              body: `We reserve the right to suspend or terminate accounts that violate these Terms of Service or engage in fraudulent or harmful behaviour, without prior notice.`,
            },
            {
              title: '11. Governing Law',
              body: `These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of Pune, Maharashtra.`,
            },
            {
              title: '12. Contact',
              body: `For questions about these Terms, email us at legal@jobkatta.in.`,
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
