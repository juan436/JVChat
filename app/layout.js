'use client'
import { CssBaseline } from '@mui/material';
import { SWRConfig } from 'swr';
import { SnackbarProvider } from 'notistack';
import './globals.css';
import CustomSnackbar from '@/components/utils/CustomSnackbar';

// Configuración para suprimir advertencias de componentes obsoletos
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes?.('Warning: Legacy context API') ||
    args[0]?.includes?.('Warning: Using UNSAFE_componentWill') ||
    (typeof args[0] === 'string' && args[0].includes('Please update the following components:'))
  ) {
    return; // Suprimir advertencias específicas
  }
  originalConsoleError(...args); // Mantener otros errores
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SnackbarProvider
          autoHideDuration={3000}
          maxSnack={3}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          Components={{
            success: CustomSnackbar,
            error: CustomSnackbar,
          }}
        >
          <SWRConfig
            value={{
              fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
            }}
          >
            <CssBaseline />
            {children}
          </SWRConfig>
        </SnackbarProvider>
      </body>
    </html>
  );
}