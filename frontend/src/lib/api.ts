function getApiBase(): string {
  // 0) Build-time override from Vite: VITE_API_URL
  try {
    // import.meta may not exist in some runtimes; guard access
    const viteUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_URL) as string | undefined;
    if (viteUrl && typeof viteUrl === 'string' && viteUrl.trim() !== '') return viteUrl;
  } catch {}

  // 1) Allow a global override set at runtime (e.g., from index.html or a script)
  const globalOverride = (typeof window !== 'undefined' && (window as any).__API_URL__) as string | undefined;
  if (globalOverride && typeof globalOverride === 'string') return globalOverride;

  // 2) Allow a persisted override via localStorage for quick manual switching
  try {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('api_url') : null;
    if (stored && typeof stored === 'string') return stored;
  } catch {}

  // 3) If running on localhost during development, point to local backend
  if (typeof window !== 'undefined') {
    const isLocal = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    if (isLocal) return 'http://localhost:4000';
    // In production (non-localhost) use a relative /api path — Vercel can rewrite /api to the backend service
    return '/api';
  }

  // 4) Fallback for non-browser environments
  return 'http://localhost:4000';
}

export function setApiBase(url: string) {
  // Persist an explicit API base override
  try {
    window.localStorage.setItem('api_url', url);
  } catch {}
}

// Backward-compatible named export for existing imports
export const API_URL: string = getApiBase();

export async function api(path: string, options: RequestInit = {}): Promise<any> {
  const base = getApiBase();
  const res = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    let message = 'Request failed';
    try {
      if (contentType.includes('application/json')) {
        const data = await res.json();
        message = (data && (data.message || data.error)) || message;
        if (!message && data && data.errors) {
          if (Array.isArray(data.errors)) message = data.errors.join(', ');
          else if (data.errors?.formErrors?.fieldErrors) message = JSON.stringify(data.errors.formErrors.fieldErrors);
        }
        if (!message) message = JSON.stringify(data);
      } else {
        const text = await res.text();
        message = text || message;
      }
    } catch {
      // ignore parse errors, keep default message
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function decodeRoleFromToken(token: string | null): 'customer' | 'supplier' | 'agent' | 'admin' | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const json = JSON.parse(atob(payload));
    return json.role || null;
  } catch {
    return null;
  }
}

export function decodeUserNameFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const json = JSON.parse(atob(payload));
    return json.fullName || json.name || json.email || null;
  } catch {
    return null;
  }
}

export function decodeUserFromToken(token: string | null): { fullName: string | null; email: string | null } {
  if (!token) return { fullName: null, email: null };
  try {
    const [, payload] = token.split('.');
    const json = JSON.parse(atob(payload));
    const fullName: string | null = json.fullName || json.name || null;
    const email: string | null = json.email || null;
    return { fullName, email };
  } catch {
    return { fullName: null, email: null };
  }
}




