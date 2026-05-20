export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

export function logout(redirect = true) {
  clearToken();
  if (redirect) {
    // force client to login page
    window.location.href = '/login';
  }
}

export default { getToken, setToken, clearToken, logout };
