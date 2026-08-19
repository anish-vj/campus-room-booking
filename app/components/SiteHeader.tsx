use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: 'Book Room' },
  { href: '/admin', label: 'Admin' },
  ];

export default function SiteHeader() {
    const pathname = usePathname();

  return (
        <header className="bg-surface border-b border-surface-border fixed top-0 w-full z-50">
              <div className="flex justify-between items-center px-4 md:px-6 py-4 max-w-container-max mx-auto w-full">
                      <Link href="/" className="font-headline text-2xl font-bold text-primary">
                                CampusReserve
                      </Link>
                      <nav className="hidden md:flex space-x-8">
                        {NAV_LINKS.map((link) => {
                      const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                      return (
                                      <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className={
                                                                            active
                                                                              ? 'text-secondary border-b-2 border-secondary pb-1 text-sm font-semibold tracking-wide'
                                                                              : 'text-on-surface-variant hover:text-primary transition-colors pb-1 text-sm font-semibold tracking-wide border-b-2 border-transparent'
                                                        }
                                                      >
                                        {link.label}
                                      </Link>
                                    );
        })}
                      </nav>
              </div>
        </header>
      );
}
</header>
