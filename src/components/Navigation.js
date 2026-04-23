"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Castle, Trophy, MessageSquare, BookOpen, Users, BrainCircuit, UserCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { getPlanetById } from '@/lib/planets';

export default function Navigation() {
  const { session, role, loading } = useAuth();
  const pathname = usePathname();

  if (pathname === '/auth' || loading) return null;
  if (!session && !role) return null;

  const isTeacher = role === 'profesor';
  
  // Detectar si estamos en una ruta de planeta (Studio o Retos)
  const pathParts = pathname.split('/');
  let currentPlanet = null;
  
  if (pathParts.includes('studio') && pathParts.length > 2) {
    currentPlanet = getPlanetById(pathParts[pathParts.indexOf('studio') + 1]);
  } else if (pathParts.includes('retos') && pathParts.length > 2) {
    currentPlanet = getPlanetById(pathParts[pathParts.indexOf('retos') + 1]);
  }

  const themeColor = currentPlanet ? currentPlanet.barColor : 'var(--accent-teal)';

  const navItems = isTeacher ? [
    { name: 'Dojo', href: '/', icon: Castle },
    { name: 'Perfil', href: '/profile', icon: UserCircle },
  ] : [
    { name: 'Dojo', href: '/', icon: Castle },
    { name: 'Retos', href: '/retos', icon: Trophy },
    { name: 'Tutor', href: '/tutor', icon: MessageSquare },
    { name: 'Pergamino', href: '/pergamino', icon: BookOpen },
  ];

  return (
    <nav className="global-navbar" style={{ '--current-accent': themeColor }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={`nav-item ${isActive ? 'active' : ''}`}
            style={isActive ? { color: 'var(--current-accent)' } : {}}
          >
            <Icon className="nav-icon" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
