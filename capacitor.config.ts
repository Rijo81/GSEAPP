import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.web.gseapp-requests',
  appName: 'GSE',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    cleartext: true, // Permite conexiones HTTP si es necesario (para desarrollo)
    allowNavigation: ['https://imfolqngdrsymfotwiib.supabase.co'], // Permite llamadas a Supabase
  }
};

export default config;
