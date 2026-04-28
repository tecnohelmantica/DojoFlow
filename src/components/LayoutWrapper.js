"use client";
import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import SidebarModals from './SidebarModals';
import Footer from './Footer';
import Onboarding from './Onboarding';

export default function LayoutWrapper({ children }) {
  const { session, role, loading } = useAuth();
  const pathname = usePathname();
  const [activeModal, setActiveModal] = useState(null);

  // Condición de visibilidad: usuario autenticado y NO en página de auth
  const isAuthPage = pathname === '/auth';
  const showUI = !isAuthPage && !!session;

  return (
    <div className={`app-container ${!showUI ? 'no-sidebar' : ''}`}>
      <Onboarding />
      <main className="main-content">
        {children}
      </main>
      {showUI && <Navigation onOpenModal={(name) => setActiveModal(name)} />}
      {showUI && <SidebarModals 
        activeModal={activeModal} 
        onClose={() => setActiveModal(null)} 
        userId={session?.user?.id}
        role={role}
      />}
      {showUI && <Footer />}
    </div>
  );
}
