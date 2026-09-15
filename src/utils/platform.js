import { Capacitor } from '@capacitor/core';

export const isNative = () => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};

export const isMobile = () => {
  const platform = getPlatform();
  return platform === 'ios' || platform === 'android';
};
