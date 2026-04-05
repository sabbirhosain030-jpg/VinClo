import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VinClo — Premium Clothing & Accessories',
  description:
    'Discover the VinClo collection — premium clothing and accessories crafted for modern style.',
  keywords: ['VinClo', 'clothing', 'fashion', 'accessories', 'premium'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a27',
                color: '#f0eeff',
                border: '1px solid #2a2a3f',
                borderRadius: '12px',
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
