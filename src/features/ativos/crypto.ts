import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

export async function sha256Hex(input: string): Promise<string> {
  // WebCrypto is fine but expo-crypto works across platforms; keep it consistent.
  // It is safe to call on web as well.
  try {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      input,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
  } catch (e) {
    // Fallback for environments where expo-crypto might not be available
    if (Platform.OS === 'web' && typeof crypto !== 'undefined' && crypto.subtle) {
      const data = new TextEncoder().encode(input);
      const hash = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
    throw e;
  }
}
