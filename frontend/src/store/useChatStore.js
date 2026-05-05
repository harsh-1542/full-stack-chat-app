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

      // console.log("Users:", res.data);
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
          const msgSenderId = msg.senderId?._id || msg.senderId;
          const msgReceiverId = msg.receiverId?._id || msg.receiverId;
          const isCurrentUserSender =
            msgSenderId?.toString() === authUser._id?.toString();
          const isCurrentUserReceiver =
            msgReceiverId?.toString() === authUser._id?.toString();

          const senderPublicKey = get().selectedUser?.publicKey;

          const text = await decryptMessage(
            msg.encryptedMessage,
            msg.nonce,
            senderPublicKey,
            myPrivateKey,
          );

          return { ...msg, text, isCurrentUserSender, isCurrentUserReceiver };
        }),
      );

      set({ messages: decryptedMessages });
    } catch (error) {
      console.log("error at get message", error);
      toast.error(error.response?.data?.message || "Error fetching messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (payload) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();
    const { text = "", image } = payload || {};

    try {
      const senderPrivateKey = localStorage.getItem("privateKey");
      const receiverPublicKey = selectedUser?.publicKey;

      if (!senderPrivateKey || !receiverPublicKey) {
        toast.error("Encryption keys missing");
        return;
      }

      // 🔐 Encrypt message text (may be empty when only sending an image)
      const { encryptedMessage, nonce } = await encryptMessage(
        text,
        receiverPublicKey,
        senderPrivateKey,
      );

      // 📡 Send encrypted message and optional image
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        {
          encryptedMessage,
          nonce,
          image,
        },
      );

      set({ messages: [...messages, { ...res.data, text }] });
    } catch (error) {
      console.log("error at sending message", error);
      toast.error("Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", async (newMessage) => {
      const { authUser } = useAuthStore.getState();

      const newMessageSenderId =
        newMessage.senderId?._id || newMessage.senderId;
      const selectedUserId = selectedUser._id?._id || selectedUser._id;
      const isMessageFromSelectedUser =
        newMessageSenderId?.toString() === selectedUserId?.toString();

      if (!isMessageFromSelectedUser) return;

      const myPrivateKey = localStorage.getItem("privateKey");

      if (!myPrivateKey) return;

      const senderPublicKey = selectedUser?.publicKey;

      const text = await decryptMessage(
        newMessage.encryptedMessage,
        newMessage.nonce,
        senderPublicKey,
        myPrivateKey,
      );

      set({
        messages: [...get().messages, { ...newMessage, text }],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
