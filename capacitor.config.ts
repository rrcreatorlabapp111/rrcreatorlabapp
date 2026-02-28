import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9199302ffe0f497a983f295b4ed0d352',
  appName: 'RR Creator Labs',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
  server: {
    url: 'https://9199302f-fe0f-497a-983f-295b4ed0d352.lovableproject.com?forceHideBadge=true',
    cleartext: true
  }
};

export default config;
