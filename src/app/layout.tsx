import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { PersonaSwitcher } from '@/components/editorial/PersonaSwitcher';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BookLeaf Publishing | Author Support & Communication Portal',
  description: 'AI-assisted communication portal for BookLeaf Publishing authors and operations team.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-[#fbfbfa] text-ink-900 antialiased selection:bg-forest-100 selection:text-forest-900">
        <header className="sticky top-0 z-50 border-b border-parchment-300 bg-[#fbfbfa]/95 backdrop-blur-md">
          <PersonaSwitcher />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
