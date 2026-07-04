import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col relative">
      {/* Absolute Ambient Background Blur Spots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] bg-amber-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[140px]" />
      </div>

      {/* Persistent Navigation Bar - Only for Guest Browsing */}
      {!user && <Navbar />}

      {/* Main Page Viewports Content */}
      <main className="flex-1 flex flex-col z-10 min-w-0">
        <Outlet />
      </main>

      {/* Subtle Platform footer - Only for Guest Pages */}
      {!user && (
        <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-600 z-10">
          <p>© 2026 SevaSaathi Marketplace. Proudly empowering local handymen and households across India.</p>
        </footer>
      )}
    </div>
  );
}
