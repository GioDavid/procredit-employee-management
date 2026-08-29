const TOKEN_KEY = 'procredit_token';

export class ApiError extends Error {
  readonly status: number;
  readonly detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

type UnauthorizedListener = () => void;

const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => {
    unauthorizedListeners.delete(listener);
  };
}

function notifyUnauthorized(): void {
  clearToken();
  for (const listener of unauthorizedListeners) {
    listener();
  }
}

function getBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_URL;
  if (!baseUrl || typeof baseUrl !== 'string') {
    throw new Error('VITE_API_URL is not configured.');
  }
  return baseUrl.replace(/\/$/, '');
}

type RequestOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  auth?: boolean;
};

async function parseError(response: Response): Promise<ApiError> {
  let message = response.statusText || 'Request failed';
  let detail: string | undefined;

  try {
    const data = (await response.json()) as {
      title?: string;
      detail?: string;
      message?: string;
    };
    detail = data.detail;
    message = data.detail || data.title || data.message || message;
  } catch {
    // Response body is not JSON; keep status text.
  }

  return new ApiError(response.status, message, detail);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await parseError(response);
    if (error.status === 401 && auth) {
      notifyUnauthorized();
    }
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
