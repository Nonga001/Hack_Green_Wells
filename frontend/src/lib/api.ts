export const API_URL: string = (import.meta as any).env.VITE_API_URL || 'http://localhost:4000';

export async function api(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('token');
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




