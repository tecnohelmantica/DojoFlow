import './globals.css';
import AuthProvider from '../components/AuthProvider';
import LayoutWrapper from '../components/LayoutWrapper';

export const metadata = {
  title: 'DojoFlow V9 | Plataforma Educativa',
  description: 'Academia tecnológica interactiva.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
