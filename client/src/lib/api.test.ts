import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Shared mock state, hoisted so it can be referenced inside the vi.mock factory.
const mocks = vi.hoisted(() => {
  const state: {
    requestInterceptor: ((config: any) => any) | null;
    responseRejected: ((error: any) => any) | null;
  } = {
    requestInterceptor: null,
    responseRejected: null,
  };

  const apiInstance: any = vi.fn();
  apiInstance.interceptors = {
    request: {
      use: (fn: any) => {
        state.requestInterceptor = fn;
      },
    },
    response: {
      use: (_fulfilled: any, rejected: any) => {
        state.responseRejected = rejected;
      },
    },
  };

  const post = vi.fn();

  return { state, apiInstance, post };
});

vi.mock('axios', () => ({
  default: {
    create: () => mocks.apiInstance,
    post: mocks.post,
  },
}));

const authMock = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
  isTokenExpired: vi.fn(),
}));

vi.mock('./auth', () => authMock);

// A manually controllable promise.
function deferred<T = unknown>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Build a 401 axios-like error with an isolated config object.
function make401() {
  return {
    response: { status: 401 },
    config: { headers: {} as Record<string, string> },
  };
}

async function loadApi() {
  vi.resetModules();
  await import('./api');
  return mocks.state;
}

describe('api auth interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    mocks.apiInstance.mockReset();
  });

  it('attaches the bearer token on outgoing requests when present', async () => {
    authMock.getAccessToken.mockReturnValue('access-123');
    const state = await loadApi();

    const config = state.requestInterceptor!({ headers: {} as Record<string, string> });

    expect(config.headers.Authorization).toBe('Bearer access-123');
  });

  it('passes through non-401 errors without refreshing', async () => {
    const state = await loadApi();
    const error = { response: { status: 500 }, config: { headers: {} } };

    await expect(state.responseRejected!(error)).rejects.toBe(error);
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('redirects to login and rejects when refresh token is missing/expired', async () => {
    authMock.getRefreshToken.mockReturnValue(null);
    const state = await loadApi();
    const error = make401();

    await expect(state.responseRejected!(error)).rejects.toBe(error);
    expect(authMock.clearTokens).toHaveBeenCalledOnce();
    expect(window.location.href).toBe('/auth/login');
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('resolves queued requests after a successful refresh', async () => {
    authMock.getRefreshToken.mockReturnValue('valid-refresh');
    authMock.isTokenExpired.mockReturnValue(false);

    const refresh = deferred<{ data: { data: { accessToken: string; refreshToken: string } } }>();
    mocks.post.mockReturnValue(refresh.promise);

    const state = await loadApi();

    // First 401 kicks off the refresh and keeps isRefreshing = true (post is pending).
    const first401 = make401();
    const firstResult = state.responseRejected!(first401);

    // Second 401 arrives while refreshing -> it is queued.
    const queued401 = make401();
    const queuedResult = state.responseRejected!(queued401);

    // Complete the refresh successfully.
    refresh.resolve({ data: { data: { accessToken: 'new-access', refreshToken: 'new-refresh' } } });
    await firstResult;
    await queuedResult;

    expect(authMock.setTokens).toHaveBeenCalledWith('new-access', 'new-refresh');
    // The queued request was retried with the refreshed token.
    expect(queued401.config.headers.Authorization).toBe('Bearer new-access');
    expect(mocks.apiInstance).toHaveBeenCalledWith(queued401.config);
  });

  it('rejects queued requests (handled) when the refresh fails', async () => {
    authMock.getRefreshToken.mockReturnValue('valid-refresh');
    authMock.isTokenExpired.mockReturnValue(false);

    const refresh = deferred();
    mocks.post.mockReturnValue(refresh.promise);

    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);

    const state = await loadApi();

    const first401 = make401();
    const firstResult = state.responseRejected!(first401);

    const queued401 = make401();
    const queuedResult = state.responseRejected!(queued401);

    const refreshError = new Error('refresh failed');
    refresh.reject(refreshError);

    // The original request that triggered the refresh rejects with the refresh error.
    await expect(firstResult).rejects.toBe(refreshError);
    // The queued request is also rejected and its rejection is propagated to the caller
    // (the .catch on the queued chain) rather than becoming an unhandled rejection.
    await expect(queuedResult).rejects.toBe(refreshError);

    // Give the microtask/macrotask queue a chance to surface any unhandled rejection.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(unhandled).not.toHaveBeenCalled();

    expect(authMock.clearTokens).toHaveBeenCalled();
    expect(window.location.href).toBe('/auth/login');
    expect(mocks.apiInstance).not.toHaveBeenCalled();

    process.off('unhandledRejection', unhandled);
  });
});
