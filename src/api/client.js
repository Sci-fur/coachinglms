import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const STORAGE_KEY = "lms_access_token";

let accessToken = localStorage.getItem(STORAGE_KEY) || null;

export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem(STORAGE_KEY, token);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const getAccessToken = () => accessToken;

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

const skipRefreshPaths = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout", "/auth/otp/send", "/auth/otp/verify", "/auth/forgot-password", "/auth/reset-password", "/auth/google"];

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !skipRefreshPaths.some((p) => originalRequest.url?.includes(p))
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await client.post("/auth/refresh");
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        onRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch {
        setAccessToken(null);
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
