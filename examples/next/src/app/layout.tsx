import '@/app/globals.css';
import type { Metadata } from 'next';

export const metadata = {
  title: 'Rehype Pretty Code',
  description: 'Beautiful code blocks for your MD/MDX docs.',
} satisfies Metadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>{children}</body>
    </html>
  );
}
