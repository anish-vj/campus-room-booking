import type { Metadata } from 'next';
import { Hanken_Grotesk, Inter } from 'next/font/google';
import './globals.css';

const hanken = Hanken_Grotesk({
    subsets: ['latin'],
    weight: ['600', '700'],
    variable: '--font-headline',
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-body',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'CampusReserve - Room Booking',
    description: 'Book a campus meeting room in seconds. No login required.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
          <html lang="en" className={`${hanken.variable} ${inter.variable}`}>
                  <body className="bg-surface text-on-surface font-body antialiased min-h-screen flex flex-col">
                    {children}
                  </body>
          </html>
        );
}
</body>
