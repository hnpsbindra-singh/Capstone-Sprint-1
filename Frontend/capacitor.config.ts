import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.resqflow.app',
  appName: 'ResQFlow',
  webDir: 'dist',
  server: {
    url: 'https://capstone-sprint-1-lrp9.vercel.app',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  }
};

export default config;
