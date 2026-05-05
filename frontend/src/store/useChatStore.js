import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { encryptMessage, decryptMessage } from "../lib/crypto";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");

      console.log("Users:", res.data);
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

 getMessages: async (userId) => {
  set({ isMessagesLoading: true });

  try {
    const res = await axiosInstance.get(`/messages/${userId}`);
    const { authUser } = useAuthStore.getState();

    const myPrivateKey = localStorage.getItem("privateKey");

    if (!myPrivateKey) {
      toast.error("Missing private key");
      return;
    }

    const decryptedMessages = await Promise.all(
      res.data.map(async (msg) => {
        const isMe = msg.senderId === authUser._id;

        const senderPublicKey = isMe
          ? authUser.publicKey
          : get().selectedUser.publicKey;

        const text = await decryptMessage(
          msg.encryptedMessage,
          msg.nonce,
          senderPublicKey,
          myPrivateKey
        );

        return { ...msg, text };
      })
    );

    set({ messages: decryptedMessages });

  } catch (error) {
    console.log("error at get message", error);
    toast.error(error.response?.data?.message || "Error fetching messages");
  } finally {
    set({ isMessagesLoading: false });
  }
},
  sendMessage: async (text) => {
  const { selectedUser, messages } = get();
  const { authUser } = useAuthStore.getState();

  console.log("selected user at chatstore:  ",selectedUser);

  console.log("auth user at chatstore", authUser);

  try {
    const senderPrivateKey = localStorage.getItem("privateKey");
    const receiverPublicKey = selectedUser.publicKey;

    console.log(senderPrivateKey , " cdscce", receiverPublicKey);

    if (!senderPrivateKey || !receiverPublicKey) {
      toast.error("Encryption keys missing");
      return;
    }

    // 🔐 Encrypt message
    const { encryptedMessage, nonce } = await encryptMessage(
      text,
      receiverPublicKey,
      senderPrivateKey
    );

    // 📡 Send encrypted
    const res = await axiosInstance.post(
      `/messages/send/${selectedUser._id}`,
      {
        encryptedMessage,
        nonce,
      }
    );

    // Add encrypted message (decrypt below if needed)
    set({ messages: [...messages, { ...res.data, text }] });

  } catch (error) {
    console.log("error at sending messgae",error)
    toast.error("Failed to send message");
  }
},

  subscribeToMessages: () => {
  const { selectedUser } = get();
  if (!selectedUser) return;

  const socket = useAuthStore.getState().socket;

  socket.on("newMessage", async (newMessage) => {
    const { authUser } = useAuthStore.getState();

    const isMessageFromSelectedUser =
      newMessage.senderId === selectedUser._id;

    if (!isMessageFromSelectedUser) return;

    const myPrivateKey = localStorage.getItem("privateKey");

    if (!myPrivateKey) return;

    const senderPublicKey =
      newMessage.senderId === authUser._id
        ? authUser.publicKey
        : selectedUser.publicKey;

    const text = await decryptMessage(
      newMessage.encryptedMessage,
      newMessage.nonce,
      senderPublicKey,
      myPrivateKey
    );

    set({
      messages: [
        ...get().messages,
        { ...newMessage, text },
      ],
    });
  });
},

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
