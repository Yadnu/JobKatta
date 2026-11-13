import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadRobots = async () => {
  vi.resetModules();
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  return (await import('./robots')).default;
};

beforeEach(() => {
  vi.unstubAllEnvs();
});

describe('robots', () => {
  it('allows the public site and blocks private areas', async () => {
    const robots = await loadRobots();
    expect(robots()).toEqual({
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/candidate/', '/employer/', '/admin/', '/auth/'],
        },
      ],
      sitemap: 'https://example.com/sitemap.xml',
    });
  });

  it('uses the production site when no public url is configured', async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SITE_URL;
    const robots = (await import('./robots')).default;
    expect(robots().sitemap).toBe('https://jobkatta.in/sitemap.xml');
  });
});
