// Server Component by default — no "use client"
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Memory Pinger',
  description: 'Email yourself one important line a day.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
