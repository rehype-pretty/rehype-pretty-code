import './globals.css';

export const metadata = {
  title: 'Rehype Pretty Code',
  description: 'Beautiful code blocks for your MD/MDX docs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
