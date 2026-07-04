import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, LogOut, ShieldAlert, UserCheck, Menu, X, Home, User, Settings, Info } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Heading */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <Logo className="w-10 h-10" />
              <div>
                <span className="font-display font-extrabold text-lg text-white tracking-tight">SevaSaathi</span>
                <span className="text-[9px] text-slate-400 block font-mono leading-none tracking-widest uppercase">Smart Local Services</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation & Profile Actions */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* Profile Badge details */}
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">{user.name}</span>
                  <span className="text-[10px] text-slate-400 flex items-center justify-end font-medium">
                    {user.role === 'admin' && <span className="text-rose-400 font-bold flex items-center"><ShieldAlert className="w-3 h-3 mr-0.5" />Admin</span>}
                    {user.role === 'provider' && <span className="text-amber-400 font-bold flex items-center"><UserCheck className="w-3 h-3 mr-0.5" />{user.providerDetails?.category || 'Service Expert'}</span>}
                    {user.role === 'customer' && <span className="text-blue-400 font-bold">Customer</span>}
                  </span>
                </div>

                {/* Avatar */}
                <div className="relative">
                  <img
                    src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=f59e0b&textColor=0f172a`}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
                  />
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-slate-900 bg-emerald-500" />
                </div>

                {/* Quick Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition duration-150 cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0 transition duration-150"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition duration-150"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-5 w-5" /> : <Menu className="block h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Slide-in Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Side Menu Drawer */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-slate-900 border-l border-slate-850 shadow-2xl z-50 transform transition-transform duration-300 ease-out md:hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="h-16 px-6 border-b border-slate-850 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <Logo className="w-6 h-6" />
              <span className="font-display font-bold text-xs text-white tracking-wider uppercase">Menu Navigation</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body (User Profile Info if logged in) */}
          <div className="flex-1 px-6 py-6 overflow-y-auto space-y-6">
            {user && (
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center space-x-3.5">
                <div className="relative">
                  <img
                    src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=f59e0b&textColor=0f172a`}
                    alt={user.name}
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-800"
                  />
                  <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-slate-900 bg-emerald-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{user.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {user.role === 'admin' && <span className="text-rose-400 font-bold">Administrator</span>}
                    {user.role === 'provider' && <span className="text-amber-400 font-bold">{user.providerDetails?.category || 'Service Expert'}</span>}
                    {user.role === 'customer' && <span className="text-blue-400 font-bold">Verified Customer</span>}
                  </p>
                </div>
              </div>
            )}

            {/* Nav Links */}
            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850/60 transition"
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span>Dashboard Home</span>
              </Link>
              
              <div className="h-px bg-slate-850 my-3" />

              {/* Status / Quick Links */}
              <div className="px-4 py-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Marketplace Stats</span>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 block">Delhi NCR</span>
                    <span className="text-xs font-bold text-white">Active Hub</span>
                  </div>
                  <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-850">
                    <span className="text-[9px] text-slate-500 block">Support AI</span>
                    <span className="text-xs font-bold text-emerald-400">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Footer (Auth Action Buttons) */}
          <div className="p-6 border-t border-slate-850 bg-slate-950/40">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white py-3 rounded-xl text-xs font-bold border border-rose-500/20 transition duration-150 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Account</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center border border-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white py-2.5 rounded-xl text-xs font-semibold transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
