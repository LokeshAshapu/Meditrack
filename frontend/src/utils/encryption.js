import CryptoJS from 'crypto-js';

// Environment dynamic key pepper with client fallback
const CLIENT_PEPPER = import.meta.env.VITE_E2EE_KEY || "MediTrack_Client_Encryption_Salt_v2026";

/**
 * Derives a specific chat's AES-256 encryption key.
 * @param {string} chatId - Unique chat thread identifier
 * @returns {string} The derived AES Passphrase
 */
const getChatKey = (chatId) => {
    if (!chatId) return CLIENT_PEPPER;
    return `${CLIENT_PEPPER}_${chatId}`;
};

/**
 * Encrypts payload text or JSON object using AES-256 before transmission.
 * @param {string|object} data - Plain text string or JSON object
 * @param {string} chatId - Chat thread ID
 * @returns {string} Encrypted string prefixed with 'ENC::'
 */
export const encryptPayload = (data, chatId) => {
    if (data === null || data === undefined) return null;
    try {
        const payloadString = typeof data === 'object' ? JSON.stringify(data) : String(data);
        const key = getChatKey(chatId);
        const encrypted = CryptoJS.AES.encrypt(payloadString, key).toString();
        return `ENC::${encrypted}`;
    } catch (error) {
        console.error("❌ Encryption error:", error);
        return data; // Safe fallback
    }
};

/**
 * Decrypts AES-256 ciphertext back to plain text or JSON object.
 * @param {string} cipherText - Encrypted string prefixed with 'ENC::'
 * @param {string} chatId - Chat thread ID
 * @param {boolean} parseJson - Whether to parse output as JSON
 * @returns {string|object} Decrypted string or object
 */
export const decryptPayload = (cipherText, chatId, parseJson = false) => {
    if (!cipherText || typeof cipherText !== 'string' || !cipherText.startsWith('ENC::')) {
        return cipherText; // Return as-is if not encrypted
    }

    try {
        const rawCipher = cipherText.substring(5); // Strip 'ENC::'
        const key = getChatKey(chatId);
        const bytes = CryptoJS.AES.decrypt(rawCipher, key);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

        if (!decryptedString) {
            console.warn("⚠️ Decryption resulted in empty string.");
            return "[Encrypted Message]";
        }

        if (parseJson) {
            return JSON.parse(decryptedString);
        }

        return decryptedString;
    } catch (error) {
        console.error("❌ Decryption error:", error);
        return "[Encrypted Message]";
    }
};
