/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5000' },
      { protocol: 'https', hostname: 'jobkatta.in' },
    ],
  },
  async rewrites() {
    return [
      { source: '/uploads/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
