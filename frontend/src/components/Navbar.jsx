import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, ShieldAlert, UserCheck, Zap, Menu } from 'lucide-react';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
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

          {/* Navigation & Profile Actions - Visible on ALL screens directly */}
          <div className="flex items-center space-x-3">
            {!user && (
              <Link
                to="/register"
                className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow transition duration-150 cursor-pointer shrink-0"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span>Need Super Fast Service</span>
              </Link>
            )}
            {user ? (
              <div className="flex items-center space-x-3.5">
                {/* Profile Badge details - hidden on small mobile, visible on tablet/desktop */}
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">{user.name}</span>
                  <span className="text-[10px] text-slate-400 flex items-center justify-end font-medium">
                    {user.role === 'admin' && <span className="text-rose-400 font-bold flex items-center"><ShieldAlert className="w-3.5 h-3.5 mr-0.5" />Admin</span>}
                    {user.role === 'provider' && <span className="text-amber-400 font-bold flex items-center"><UserCheck className="w-3.5 h-3.5 mr-0.5" />{user.providerDetails?.category || 'Service Expert'}</span>}
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
              // Sign In and Sign Up (Join Us) directly visible on ALL screens
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white px-3 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-black shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition duration-150"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
