import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { generateKeyPair } from "../lib/crypto";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
    

    const privateKey = localStorage.getItem("privateKey");

    if (!privateKey) {
      toast.error("No private key found. Please log in again.");
      console.warn("No private key found — encryption will fail");
    }
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

 signup: async (data) => {
  set({ isSigningUp: true });

  try {
    const res = await axiosInstance.post("/auth/signup", data);

    // 🔑 Generate keys
    const { publicKey, privateKey } = await generateKeyPair();

    // Save public key to backend
    const keyRes = await axiosInstance.post("/auth/public-key", { publicKey });

if (keyRes.status !== 200) {
  toast.error("Failed to store public key");
  throw new Error("Failed to store public key");
}
    // Store private key locally
    localStorage.setItem("privateKey", privateKey);

    set({ authUser: { ...res.data, publicKey } });

    toast.success("Account created successfully");
    get().connectSocket();

  } catch (error) {
    console.log(error);
    toast.error(error.response?.data?.message || "Signup failed");
  } finally {
    set({ isSigningUp: false });
  }
},

  login: async (data) => {
  set({ isLoggingIn: true });

  try {
    const res = await axiosInstance.post("/auth/login", data);

    let privateKey = localStorage.getItem("privateKey");

    // 🔥 If no key → generate new (fallback)
    if (!privateKey) {
      const { publicKey, privateKey: newPrivateKey } = await generateKeyPair();

      await axiosInstance.post("/users/public-key", { publicKey });

      localStorage.setItem("privateKey", newPrivateKey);

      privateKey = newPrivateKey;
    }

    set({ authUser: res.data });

    toast.success("Logged in successfully");
    get().connectSocket();

  } catch (error) {
    toast.error(error.response?.data?.message || "Login failed");
  } finally {
    set({ isLoggingIn: false });
  }
},

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
