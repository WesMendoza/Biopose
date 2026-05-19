import { API_BASE } from '../config';
import auth from './auth';

function buildHeaders(isJson = true, extra: Record<string,string> = {}) {
  const headers: Record<string,string> = { ...extra };
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function parseResponse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, options);
  const data = await parseResponse(res);
  if (!res.ok) {
    if (res.status === 401) {
      // automatic logout on unauthorized
      try { auth.logout(); } catch {}
    }
    const err = new Error(data?.mensaje || res.statusText || 'API error');
    // @ts-ignore
    err.response = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path: string) => apiFetch(path, { method: 'GET', headers: buildHeaders(true) }),
  post: (path: string, body: any) => apiFetch(path, { method: 'POST', headers: buildHeaders(true), body: JSON.stringify(body) }),
  postForm: (path: string, form: FormData) => apiFetch(path, { method: 'POST', body: form, headers: buildHeaders(false) }),
  put: (path: string, body: any) => apiFetch(path, { method: 'PUT', headers: buildHeaders(true), body: JSON.stringify(body) }),
  patch: (path: string, body: any) => apiFetch(path, { method: 'PATCH', headers: buildHeaders(true), body: JSON.stringify(body) }),
  del: (path: string) => apiFetch(path, { method: 'DELETE', headers: buildHeaders(true) }),
};

export default api;
