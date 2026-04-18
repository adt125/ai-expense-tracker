import api from "./api";

const ENCRYPTED_PREFIX = "enc:";

let cachedPublicKey;

function stringToArrayBuffer(value) {
  return new TextEncoder().encode(value);
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary);
}

function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, "");

  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

async function getPublicKey() {
  if (cachedPublicKey) {
    return cachedPublicKey;
  }

  const response = await api.get("/auth/public-key");
  const keyData = pemToArrayBuffer(response.data.public_key);
  cachedPublicKey = await window.crypto.subtle.importKey(
    "spki",
    keyData,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"],
  );

  return cachedPublicKey;
}

export async function encryptPassword(password) {
  if (!window.isSecureContext || !window.crypto?.subtle) {
    throw new Error(
      "Secure password encryption is unavailable in this browser context. Use HTTPS or localhost.",
    );
  }

  const publicKey = await getPublicKey();
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    stringToArrayBuffer(password),
  );

  return `${ENCRYPTED_PREFIX}${arrayBufferToBase64(encrypted)}`;
}
