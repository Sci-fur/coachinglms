import { create } from "zustand";
import client, { setAccessToken } from "../api/client";

const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const { data } = await client.post("/auth/login", { email, password });
    const { user, accessToken } = data.data;
    setAccessToken(accessToken);
    set({ user });
    return user;
  },

  register: async (payload) => {
    const { data } = await client.post("/auth/register", payload);
    const { user, accessToken } = data.data;
    setAccessToken(accessToken);
    set({ user });
    return user;
  },

  sendOtp: async (phone) => {
    await client.post("/auth/otp/send", { phone });
  },

  verifyOtp: async (phone, otp) => {
    const { data } = await client.post("/auth/otp/verify", { phone, otp });
    const { user, accessToken } = data.data;
    setAccessToken(accessToken);
    set({ user });
    return data.data;
  },

  googleLogin: async (accessToken) => {
    const { data } = await client.post("/auth/google", { accessToken });
    const { user, accessToken: jwtToken, needsProfileCompletion } = data.data;
    setAccessToken(jwtToken);
    set({ user });
    return { user, needsProfileCompletion };
  },

  updateProfile: async (payload) => {
    const { data } = await client.patch("/auth/profile", payload);
    const { user } = data.data;
    set({ user });
    return user;
  },

  sendPhoneOtp: async (phone) => {
    await client.post("/auth/phone/send-otp", { phone });
  },

  verifyPhoneOtp: async (phone, otp) => {
    const { data } = await client.post("/auth/phone/verify", { phone, otp });
    const { user } = data.data;
    set({ user });
    return user;
  },

  forgotPassword: async (emailOrPhone) => {
    const payload = emailOrPhone.includes("@")
      ? { email: emailOrPhone }
      : { phone: emailOrPhone };
    const { data } = await client.post("/auth/forgot-password", payload);
    return data;
  },

  resetPassword: async (token, password) => {
    await client.post("/auth/reset-password", { token, password });
  },

  fetchMe: async () => {
    try {
      set({ isLoading: true });
      const { data } = await client.get("/auth/me");
      set({ user: data.data.user, isLoading: false });
      return data.data.user;
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  initialize: async () => {
    try {
      set({ isLoading: true });
      const { data } = await client.post("/auth/refresh");
      const { accessToken: newToken } = data.data;
      setAccessToken(newToken);
      const meRes = await client.get("/auth/me");
      set({ user: meRes.data.data.user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await client.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
      set({ user: null });
    }
  },
}));

export default useAuthStore;
