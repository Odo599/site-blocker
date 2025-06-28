// Utility: Convert ArrayBuffer to hex string
function bufferToHex(buffer) {
    return [...new Uint8Array(buffer)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

// Utility: Convert hex string to ArrayBuffer
function hexToBuffer(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
}

// Generate a random 16-byte salt
function generateSalt() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return bufferToHex(array);
}

// Derive a key from password and salt using PBKDF2
async function hashPassword(password, saltHex) {
    const enc = new TextEncoder();
    const salt = hexToBuffer(saltHex);
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
    const rawKey = await crypto.subtle.exportKey("raw", key);
    return bufferToHex(rawKey);
}

// Set a new password
async function setPassword(password) {
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    localStorage.setItem("passwordHash", passwordHash);
    localStorage.setItem("salt", salt);
}

// Check if password is correct
async function checkPassword(inputPassword) {
    const passwordHash = localStorage.getItem("passwordHash");
    const salt = localStorage.getItem("salt");
    if (!passwordHash || !salt) return false;
    const inputHash = await hashPassword(inputPassword, salt);
    return inputHash === passwordHash;
}

export { setPassword, checkPassword };
