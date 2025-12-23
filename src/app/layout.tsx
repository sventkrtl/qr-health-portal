import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QR Health Portal | Quantum Rishi',
  description: 'AI-powered health record management by Quantum Rishi (SV Enterprises)',
  keywords: ['health', 'medical records', 'AI', 'health portal', 'quantum rishi'],
  authors: [{ name: 'SV Enterprises', url: 'https://quantum-rishi.com' }],
  openGraph: {
    title: 'QR Health Portal',
    description: 'AI-powered health record management',
    url: 'https://health.quantum-rishi.com',
    siteName: 'QR Health Portal',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}