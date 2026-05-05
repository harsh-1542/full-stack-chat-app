import sodium from "libsodium-wrappers";

let isReady = false;

export const initCrypto = async () => {
  if (!isReady) {
    await sodium.ready;
    isReady = true;
  }
};

// 🔑 Generate key pair
export const generateKeyPair = async () => {
  await initCrypto();

  const keyPair = sodium.crypto_box_keypair();

  return {
    publicKey: sodium.to_base64(keyPair.publicKey),
    privateKey: sodium.to_base64(keyPair.privateKey),
  };
};

// 🔐 Encrypt message
export const encryptMessage = async (
  message,
  receiverPublicKey,
  senderPrivateKey
) => {
  await initCrypto();

  try {
    const nonce = sodium.randombytes_buf(
      sodium.crypto_box_NONCEBYTES
    );

     // ✅ Convert string → Uint8Array before encrypting
    const messageBytes = sodium.from_string(message);
    const encrypted = sodium.crypto_box_easy(
      messageBytes,
      nonce,
      sodium.from_base64(receiverPublicKey),
      sodium.from_base64(senderPrivateKey)
    );

    return {
      encryptedMessage: sodium.to_base64(encrypted),
      nonce: sodium.to_base64(nonce),
    };

  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Encryption failed");
  }
};  

// 🔓 Decrypt message
export const decryptMessage = async (
  encryptedMessage,
  nonce,
  senderPublicKey,
  receiverPrivateKey
) => {
  await initCrypto();

  try {
    const decrypted = sodium.crypto_box_open_easy(
      sodium.from_base64(encryptedMessage),
      sodium.from_base64(nonce),
      sodium.from_base64(senderPublicKey),
      sodium.from_base64(receiverPrivateKey)
    );

    return sodium.to_string(decrypted);
  } catch (err) {
    return "[Decryption failed]";
  }
};