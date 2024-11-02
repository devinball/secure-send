function base64toArrayBuffer(base64) {
    const binaryString = atob(base64);

    const length = binaryString.length;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer
}

function arrayBuffertoBase64(buffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var length = bytes.byteLength;

    for (let i = 0; i < length; i++) {
        binary += String.fromCharCode(bytes[i])
    }

    return btoa(binary);
}

function toJson(obj) {
    return JSON.stringify(
        {
            cipherText: arrayBuffertoBase64(obj.cipherText),
            iv: arrayBuffertoBase64(obj.iv)
        }
    )
}

function fromJson(str) {
    o = JSON.parse(str)
    o.cipherText = base64toArrayBuffer(o.cipherText)
    o.iv = base64toArrayBuffer(o.iv)
    return o;
}

// https://stackoverflow.com/questions/62102034/javascript-how-to-encrypt-string-with-only-password-in-2020
async function deriveKey(password) {
    const algo = {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: new TextEncoder().encode('a-unique-salt'),
        iterations: 1000
    }

    return window.crypto.subtle.deriveKey(
        algo,
        await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(password),
            {
                name: algo.name
            },
            false,
            ['deriveKey']
        ),
        {
            name: "AES-GCM",
            length: 256
        },
        false,
        ['encrypt', 'decrypt']
    )
}

async function encrypt(text, password) {
    const algo = {
        name: 'AES-GCM',
        length: 256,
        iv: crypto.getRandomValues(new Uint8Array(12))
    }

    cipherText = await crypto.subtle.encrypt(
        algo,
        await deriveKey(password),
        new TextEncoder().encode(text)
    )
    
    return {
        cipherText: cipherText,
        iv: algo.iv
    }
}

async function decrypt(encrypted, password) {
    const algo = {
        name: 'AES-GCM',
        length: 256,
        iv: encrypted.iv
    }

    return new TextDecoder().decode(
        await crypto.subtle.decrypt(
            algo,
            await deriveKey(password),
            encrypted.cipherText
        )
    )
}