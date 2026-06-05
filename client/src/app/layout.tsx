import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'Job Katta — Apni Naukri, Apne Shehar Mein',
  description: 'Hyperlocal hiring platform for India. Find jobs in your city or hire local talent.',
  keywords: 'jobs, hiring, India, local jobs, freshers, employment',
  openGraph: {
    title: 'Job Katta',
    description: 'Hyperlocal hiring platform for India.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
