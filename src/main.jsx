import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import i18next from 'i18next';

import global_en from './translations/en/global.json';
import global_es from './translations/es/global.json';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { UserProvider } from './context/UserProvider.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';

i18next.use(initReactI18next).init({
  interpolation: { escapeValue: false },
  lng: localStorage.getItem('lng') || 'es',
  resources: {
    en: {
      global: global_en,
    },
    es: {
      global: global_es,
    },
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <SnackbarProvider
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <UserProvider>
        <I18nextProvider i18n={i18next}>
          <App />
        </I18nextProvider>
      </UserProvider>
    </SnackbarProvider>
  </QueryClientProvider>
);
