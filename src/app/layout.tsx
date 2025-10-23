import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vitallink',
  description: 'Sua saúde conectada.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
