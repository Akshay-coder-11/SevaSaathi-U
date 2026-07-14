import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { 
  Home, Briefcase, MapPin, Sparkles, Users, Clock, LogOut, 
  ShieldAlert, UserCheck, Menu, X, ArrowLeftRight, HelpCircle, Star, ShieldCheck, Heart
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  // Custom Navigation Links based on role
  const getNavLinks = () => {
    let links = [];
    if (user.role === 'customer') {
      links = [
        { id: 'browse', label: 'Find Experts', icon: Home, badge: 'Active' },
        { id: 'favorites', label: 'My Favorites', icon: Heart },
        { id: 'bookings', label: 'My Bookings', icon: Briefcase },
        { id: 'addresses', label: 'Doorstep Address', icon: MapPin },
        { id: 'ai-mitra', label: 'SevaSaathi AI Support', icon: Sparkles, highlight: true }
      ];
    } else if (user.role === 'provider') {
      links = [
        { id: 'jobs', label: 'Active Jobs Feed', icon: Briefcase },
        { id: 'availability', label: 'My Availability', icon: Clock }
      ];
    } else if (user.role === 'admin') {
      links = [
        { id: 'users', label: 'User Directory', icon: Users },
        { id: 'approvals', label: 'Pending Approvals', icon: ShieldAlert }
      ];
    }
    // Append My Profile for all logged in users
    links.push({ id: 'profile', label: 'My Profile', icon: UserCheck });
    return links;
  };

  const navLinks = getNavLinks();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800/80 text-slate-200">
      
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Logo className="w-9 h-9" />
          <div className="flex flex-col">
            <span className="font-display font-black text-sm text-white tracking-wider uppercase leading-none">SevaSaathi</span>
            <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest font-mono mt-0.5">Community Hub</span>
          </div>
        </div>
      </div>

      {/* Nav Link List */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Control Panel</span>
        </div>
        
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isSelected = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => {
                setActiveTab(link.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs font-semibold tracking-wide transition duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/10'
                  : link.highlight
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4.5 h-4.5 ${isSelected ? 'text-slate-950' : link.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </div>
              {link.badge && !isSelected && (
                <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 uppercase">
                  {link.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Informative Help Card inside Sidebar */}
        <div className="pt-6">
          <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-850 text-[11px] leading-relaxed text-slate-400 space-y-2">
            <div className="flex items-center space-x-1 text-white font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saathi Guarantee</span>
            </div>
            <p>100% verified specialists. Zero marketplace service commission charged directly to our helpers.</p>
          </div>
        </div>
      </div>

      {/* User Session Profile Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=f59e0b&textColor=0f172a`}
                alt={user.name}
                className="w-9 h-9 rounded-lg object-cover ring-2 ring-slate-800"
              />
              <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-slate-900 bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-none">{user.name}</p>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                {user.role === 'admin' && 'Admin'}
                {user.role === 'provider' && (user.providerDetails?.category || 'Service Provider')}
                {user.role === 'customer' && 'Customer'}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 shrink-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sticky Top Header with Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <Logo className="w-8.5 h-8.5" />
          <span className="font-display font-extrabold text-base text-white tracking-tight uppercase">SevaSaathi</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Slide-in Overlay */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-in Drawer Container */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out md:hidden ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="relative h-full">
          {/* Close trigger button inside drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition z-50"
          >
            <X className="w-5 h-5" />
          </button>
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
