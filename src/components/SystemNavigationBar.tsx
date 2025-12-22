import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';

import { useAppTheme } from '../contexts/themeContext';

export function SystemNavigationBar() {
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const apply = async () => {
      try {
        await NavigationBar.setVisibilityAsync('visible');
        await NavigationBar.setBackgroundColorAsync(colors.card);
        await NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
      } catch {
        // Best-effort only
      }
    };

    apply();
  }, [colors.card, isDark]);

  return null;
}
