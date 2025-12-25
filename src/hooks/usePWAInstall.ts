import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { isMobileWeb, isStandalone, isIOS } from '../utils/platform';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAInstallResult {
  /** Se o prompt de instalação está disponível (Android) */
  canInstall: boolean;
  /** Se é iOS e pode mostrar instruções manuais */
  showIOSInstructions: boolean;
  /** Função para disparar o prompt de instalação (Android) */
  install: () => Promise<boolean>;
  /** Se o usuário já instalou ou dispensou o prompt */
  wasInstallHandled: boolean;
}

/**
 * Hook para gerenciar instalação de PWA
 * Funciona apenas na web mobile, não faz nada em desktop ou apps nativos
 */
export function usePWAInstall(): UsePWAInstallResult {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [wasInstallHandled, setWasInstallHandled] = useState(false);

  // Verifica condições básicas
  const isWebMobile = Platform.OS === 'web' && isMobileWeb();
  const isAlreadyInstalled = Platform.OS === 'web' && isStandalone();
  const isIOSDevice = Platform.OS === 'web' && isIOS();

  useEffect(() => {
    // Só roda na web mobile e se não estiver instalado
    if (Platform.OS !== 'web' || !isWebMobile || isAlreadyInstalled) {
      return;
    }

    // Não precisa escutar evento no iOS (não suporta beforeinstallprompt)
    if (isIOSDevice) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne o mini-infobar automático do Chrome
      e.preventDefault();
      // Armazena o evento para uso posterior
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setWasInstallHandled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isWebMobile, isAlreadyInstalled, isIOSDevice]);

  const install = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }

    try {
      // Mostra o prompt de instalação
      await deferredPrompt.prompt();
      
      // Aguarda a escolha do usuário
      const choiceResult = await deferredPrompt.userChoice;
      
      // Limpa o prompt (só pode ser usado uma vez)
      setDeferredPrompt(null);
      setWasInstallHandled(true);
      
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Não mostra nada se não for web mobile ou já estiver instalado
  if (!isWebMobile || isAlreadyInstalled) {
    return {
      canInstall: false,
      showIOSInstructions: false,
      install: async () => false,
      wasInstallHandled: false,
    };
  }

  return {
    canInstall: deferredPrompt !== null,
    showIOSInstructions: isIOSDevice && !wasInstallHandled,
    install,
    wasInstallHandled,
  };
}
