import './globals.css';
import Head from 'next/head';
import Navigation from '@/components/Navigation';
import KeyboardShortcutsWrapper from '@/components/KeyboardShortcutsWrapper';
import { CartProvider } from '@/hooks/useCart';
import { AuthProvider } from '@/hooks/useAuth';
import { StatusPillProvider } from '@/contexts/StatusPillContext';

export const metadata = {
  title: 'The Grove',
  description: 'Tiruppur\'s Hidden Sanctuary',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Work+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          .material-symbols-outlined {
            font-family: 'Material Symbols Outlined', sans-serif !important;
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}} />
      </head>
      <body suppressHydrationWarning>
        <KeyboardShortcutsWrapper>
          <AuthProvider>
            <CartProvider>
              <StatusPillProvider>
                <Navigation />
                {children}
              </StatusPillProvider>
            </CartProvider>
          </AuthProvider>
        </KeyboardShortcutsWrapper>
      </body>
    </html>
  );
}
