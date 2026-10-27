import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tempo.app',
  appName: 'Tempo',
  webDir: 'dist',
  server: {
    url: 'http://192.168.31.208:5174', // ← IP компьютера + порт Vite
    cleartext: true,
    androidScheme: 'http',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;