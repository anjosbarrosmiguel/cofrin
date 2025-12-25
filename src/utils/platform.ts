import { Platform } from 'react-native';

/**
 * Detecta se o app está rodando em um navegador mobile (Android ou iOS)
 * Retorna false para desktop e apps nativos
 */
export function isMobileWeb(): boolean {
  if (Platform.OS !== 'web') return false;
  
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || navigator.vendor || '';
  
  // Detecta dispositivos móveis por user agent
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  
  // Também verifica por touch capability + tela pequena (backup)
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;
  
  return mobileRegex.test(userAgent) || (hasTouchScreen && isSmallScreen);
}

/**
 * Detecta se o dispositivo é iOS (Safari mobile)
 */
export function isIOS(): boolean {
  if (Platform.OS !== 'web') return false;
  
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent || '';
  
  // Detecta iOS por user agent
  // Nota: iPad com iOS 13+ reporta como Mac, então verificamos também por touch
  const isIOSUserAgent = /iPhone|iPad|iPod/i.test(userAgent);
  const isMacWithTouch = /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;
  
  return isIOSUserAgent || isMacWithTouch;
}

/**
 * Detecta se o app já está instalado como PWA (modo standalone)
 */
export function isStandalone(): boolean {
  if (Platform.OS !== 'web') return false;
  
  if (typeof window === 'undefined') return false;

  // Verifica display-mode standalone (Chrome, Edge, Firefox)
  const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  // Verifica se foi adicionado à tela inicial no iOS Safari
  const isIOSStandalone = (navigator as any).standalone === true;
  
  return isDisplayStandalone || isIOSStandalone;
}

/**
 * Detecta se é Android mobile web
 */
export function isAndroidWeb(): boolean {
  if (Platform.OS !== 'web') return false;
  
  if (typeof navigator === 'undefined') return false;
  
  const userAgent = navigator.userAgent || '';
  return /Android/i.test(userAgent);
}
