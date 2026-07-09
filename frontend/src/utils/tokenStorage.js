import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../constants';

// "Remember me" persists across browser restarts (localStorage); otherwise
// the session ends when the tab/browser closes (sessionStorage).
let rememberMe = localStorage.getItem('chatapp_remember_me') === 'true';

const getStore = () => (rememberMe ? localStorage : sessionStorage);

export const setRememberMe = (value) => {
  rememberMe = value;
  localStorage.setItem('chatapp_remember_me', String(value));
};

export const setTokens = ({ accessToken, refreshToken }) => {
  const store = getStore();
  if (accessToken) store.setItem(AUTH_TOKEN_KEY, accessToken);
  if (refreshToken) store.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = () =>
  localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);

export const getRefreshToken = () =>
  localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);

export const clearTokens = () => {
  [localStorage, sessionStorage].forEach((store) => {
    store.removeItem(AUTH_TOKEN_KEY);
    store.removeItem(REFRESH_TOKEN_KEY);
  });
};
