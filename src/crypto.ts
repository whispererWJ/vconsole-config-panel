/**
 * 加密工具模块
 * 支持AES和RSA加密
 */

import type { AESConfig, RSAConfig } from './types';

/**
 * 将字符串转换为Uint8Array
 */
function stringToUint8Array(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * 将Uint8Array转换为字符串
 */
function uint8ArrayToString(uint8Array: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(uint8Array);
}

/**
 * ArrayBuffer转Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Base64转ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * 将字符串安全地转换为BufferSource
 */
function toBufferSource(data: Uint8Array): BufferSource {
  return data.buffer as ArrayBuffer;
}

/**
 * 计算SHA-256哈希
 */
async function sha256(message: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

/**
 * 确保密钥长度正确（128位或256位）
 */
async function normalizeKey(key: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(key);

  // AES-256 需要 32 字节 (256位)
  const TARGET_LENGTH = 32;

  if (keyBytes.length === TARGET_LENGTH) {
    return keyBytes;
  }

  return await sha256(key);
}

/**
 * 确保IV长度正确（16字节）
 */
function normalizeIv(iv: string): Uint8Array {
  const encoder = new TextEncoder();
  const ivBytes = encoder.encode(iv);

  const TARGET_LENGTH = 16;

  if (ivBytes.length === TARGET_LENGTH) {
    return ivBytes;
  }

  const result = new Uint8Array(TARGET_LENGTH);
  const copyLength = Math.min(ivBytes.length, TARGET_LENGTH);
  result.set(ivBytes.slice(0, copyLength));
  return result;
}

/**
 * 生成AES密钥（用于Web Crypto API）
 */
async function getAesKey(key: string): Promise<CryptoKey> {
  const keyData = await normalizeKey(key);
  return await crypto.subtle.importKey(
    'raw',
    toBufferSource(keyData),
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * AES-CBC加密
 */
export async function aesEncrypt(data: string, config: AESConfig): Promise<string> {
  try {
    const key = await getAesKey(config.key);
    const iv = normalizeIv(config.iv);

    const encodedData = stringToUint8Array(data);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv: toBufferSource(iv),
      },
      key,
      toBufferSource(encodedData)
    );

    return arrayBufferToBase64(encrypted);
  } catch (error) {
    console.error('AES加密失败:', error);
    throw new Error('AES加密失败');
  }
}

/**
 * AES-CBC解密
 */
export async function aesDecrypt(encryptedData: string, config: AESConfig): Promise<string> {
  try {
    const key = await getAesKey(config.key);
    const iv = normalizeIv(config.iv);

    const encryptedBuffer = base64ToArrayBuffer(encryptedData);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: toBufferSource(iv),
      },
      key,
      encryptedBuffer
    );

    return uint8ArrayToString(new Uint8Array(decrypted));
  } catch (error) {
    console.error('AES解密失败:', error);
    throw new Error('AES解密失败');
  }
}

/**
 * RSA加密（使用Web Crypto API）
 */
export async function rsaEncrypt(data: string, config: RSAConfig): Promise<string> {
  try {
    const publicKeyData = stringToUint8Array(config.publicKey);
    const publicKey = await crypto.subtle.importKey(
      'spki',
      toBufferSource(publicKeyData),
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt']
    );

    const encodedData = stringToUint8Array(data);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      toBufferSource(encodedData)
    );

    return arrayBufferToBase64(encrypted);
  } catch (error) {
    console.error('RSA加密失败:', error);
    throw new Error('RSA加密失败');
  }
}

/**
 * RSA解密（使用Web Crypto API）
 */
export async function rsaDecrypt(encryptedData: string, config: RSAConfig): Promise<string> {
  if (!config.privateKey) {
    throw new Error('RSA解密需要私钥');
  }

  try {
    const privateKeyData = stringToUint8Array(config.privateKey);
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      toBufferSource(privateKeyData),
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['decrypt']
    );

    const encryptedBuffer = base64ToArrayBuffer(encryptedData);
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      privateKey,
      encryptedBuffer
    );

    return uint8ArrayToString(new Uint8Array(decrypted));
  } catch (error) {
    console.error('RSA解密失败:', error);
    throw new Error('RSA解密失败');
  }
}

/**
 * 分段加密
 */
export async function encryptWithChunks(
  data: string,
  encryptFn: (chunk: string) => Promise<string>,
  chunkSize: number = 100
): Promise<string> {
  const chunks: string[] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.substring(i, i + chunkSize));
  }

  const encryptedChunks = await Promise.all(chunks.map(chunk => encryptFn(chunk)));
  return encryptedChunks.join('|SEP|');
}

/**
 * 分段解密
 */
export async function decryptWithChunks(
  encryptedData: string,
  decryptFn: (chunk: string) => Promise<string>
): Promise<string> {
  const chunks = encryptedData.split('|SEP|');
  const decryptedChunks = await Promise.all(chunks.map(chunk => decryptFn(chunk)));
  return decryptedChunks.join('');
}

/**
 * 完整的加密流程（先AES再RSA）
 */
export async function encryptData(
  data: Record<string, any>,
  aesConfig?: AESConfig,
  rsaConfig?: RSAConfig
): Promise<string> {
  let jsonStr = JSON.stringify(data);
  let result = jsonStr;

  // 1. 先进行AES加密
  if (aesConfig) {
    try {
      result = await aesEncrypt(result, aesConfig);
    } catch (error) {
      console.error('AES加密失败:', error);
      throw new Error('AES加密失败');
    }
  }

  // 2. 再进行RSA加密
  if (rsaConfig) {
    try {
      if (result.length > 100) {
        result = await encryptWithChunks(
          result,
          (chunk) => rsaEncrypt(chunk, rsaConfig),
          100
        );
      } else {
        result = await rsaEncrypt(result, rsaConfig);
      }
    } catch (error) {
      console.error('RSA加密失败:', error);
      throw new Error('RSA加密失败');
    }
  }

  return result;
}

/**
 * 完整的解密流程（先RSA再AES）
 */
export async function decryptData(
  encryptedData: string,
  aesConfig?: AESConfig,
  rsaConfig?: RSAConfig
): Promise<Record<string, any>> {
  let result = encryptedData;

  // 1. 先进行RSA解密
  if (rsaConfig && rsaConfig.privateKey) {
    try {
      if (result.includes('|SEP|')) {
        result = await decryptWithChunks(
          result,
          (chunk) => rsaDecrypt(chunk, rsaConfig)
        );
      } else {
        result = await rsaDecrypt(result, rsaConfig);
      }
    } catch (error) {
      console.error('RSA解密失败:', error);
      throw new Error('RSA解密失败');
    }
  }

  // 2. 再进行AES解密
  if (aesConfig) {
    try {
      result = await aesDecrypt(result, aesConfig);
    } catch (error) {
      console.error('AES解密失败:', error);
      throw new Error('AES解密失败');
    }
  }

  return JSON.parse(result);
}

/**
 * 生成RSA密钥对（用于测试）
 */
export async function generateRSAKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );

    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: arrayBufferToBase64(publicKeyBuffer),
      privateKey: arrayBufferToBase64(privateKeyBuffer),
    };
  } catch (error) {
    console.error('生成RSA密钥对失败:', error);
    throw new Error('生成RSA密钥对失败');
  }
}