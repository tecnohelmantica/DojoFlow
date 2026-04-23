"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname === '/auth') return null;

  return (
    <footer className="app-footer">
      <div className="license-info" style={{ marginBottom: '16px', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
        <p>
          <span style={{ fontWeight: '600', color: 'var(--accent-teal)' }}>DojoFlow</span> © 2026 por 
          <span style={{ fontWeight: '600' }}> Tecnohelmantica</span> está bajo licencia 
          <a 
            href="https://creativecommons.org/licenses/by-sa/4.0/?ref=chooser-v1" 
            target="_blank" 
            rel="license noopener noreferrer" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '6px', color: 'var(--accent-teal)', fontWeight: '600', textDecoration: 'none' }}
          >
            CC BY-SA 4.0
            <span style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
              <img style={{ height: '18px' }} src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt="CC" />
              <img style={{ height: '18px' }} src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt="BY" />
              <img style={{ height: '18px' }} src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1" alt="SA" />
            </span>
          </a>
        </p>
      </div>

      <div className="footer-links">
        <Link href="/privacidad" className="footer-link">
          Política de Privacidad
        </Link>
        <span style={{ color: '#8a8a9e', opacity: 0.5 }}>•</span>
        <Link href="/aviso-legal" className="footer-link">
          Aviso Legal
        </Link>
      </div>
    </footer>
  );
}
