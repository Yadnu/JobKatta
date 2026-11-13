import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadSitemap = async () => {
  vi.resetModules();
  process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com/api';
  return (await import('./sitemap')).default;
};

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.stubGlobal('fetch', vi.fn());
});

describe('sitemap', () => {
  it('includes the static public routes', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ data: [] }) } as Response);
    const sitemap = await loadSitemap();
    const routes = await sitemap();
    const urls = routes.map((route) => route.url);

    expect(urls).toEqual(expect.arrayContaining([
      'https://example.com/',
      'https://example.com/jobs',
      'https://example.com/companies',
      'https://example.com/pricing',
      'https://example.com/about',
      'https://example.com/contact',
    ]));
    expect(routes.find((route) => route.url === 'https://example.com/jobs')).toMatchObject({
      changeFrequency: 'hourly',
      priority: 0.9,
    });
  });

  it('adds job and company urls from the API', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes('/jobs/employers')) {
        return { ok: true, json: async () => ({ data: [{ id: 'emp-1' }] }) } as Response;
      }
      return { ok: true, json: async () => ({ data: [{ id: 'job-1' }] }) } as Response;
    });

    const sitemap = await loadSitemap();
    const routes = await sitemap();

    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/jobs?limit=200',
      { next: { revalidate: 3600 } },
    );
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/jobs/employers?limit=100',
      { next: { revalidate: 3600 } },
    );
    expect(routes).toEqual(expect.arrayContaining([
      expect.objectContaining({ url: 'https://example.com/jobs/job-1', priority: 0.8, changeFrequency: 'daily' }),
      expect.objectContaining({ url: 'https://example.com/companies/emp-1', priority: 0.6, changeFrequency: 'weekly' }),
    ]));
  });

  it('omits dynamic routes when the API responds with an error', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, json: async () => ({}) } as Response);
    const sitemap = await loadSitemap();
    const routes = await sitemap();
    expect(routes.map((route) => route.url).some((url) => url.includes('/jobs/'))).toBe(false);
    expect(routes).toHaveLength(6);
  });

  it('omits dynamic routes when the API request throws', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    const sitemap = await loadSitemap();
    const routes = await sitemap();
    expect(routes).toHaveLength(6);
  });

  it('treats a missing data array as no ids', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
    const sitemap = await loadSitemap();
    const routes = await sitemap();
    expect(routes).toHaveLength(6);
  });
});
