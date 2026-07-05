import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { X, User, ShieldCheck, Mail, LogIn, Sparkles } from 'lucide-react';

export default function GoogleSignInButton({ role = 'customer', onAuthSuccess, onAuthError }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showChooser, setShowChooser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Check for environment client ID
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    // Only attempt real initialization if client ID is set
    if (googleClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleRealGoogleResponse,
          auto_select: false,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('real-google-btn-container'),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      } catch (err) {
        console.warn('Real Google Auth initialization failed:', err);
      }
    }
  }, [googleClientId]);

  const handleRealGoogleResponse = async (response) => {
    if (!response.credential) return;
    setIsLoading(true);
    try {
      const user = await loginWithGoogle({ credential: response.credential, role });
      if (onAuthSuccess) {
        onAuthSuccess(user);
      } else {
        navigate('/');
      }
    } catch (err) {
      if (onAuthError) onAuthError(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatedLogin = async (email, name, picture) => {
    setIsLoading(true);
    setShowChooser(false);
    try {
      const user = await loginWithGoogle({
        email,
        name,
        picture: picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=4285f4&textColor=ffffff`,
        role,
        phone: '9999999999'
      });
      if (onAuthSuccess) {
        onAuthSuccess(user);
      } else {
        navigate('/');
      }
    } catch (err) {
      if (onAuthError) onAuthError(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customEmail || !customName) return;
    handleSimulatedLogin(customEmail, customName);
  };

  const handleClick = () => {
    if (googleClientId) {
      // Let GIS handle click or trigger it
      return;
    }
    // No client ID configured, trigger our beautiful custom high-fidelity Google Chooser popup
    setShowChooser(true);
  };

  // Preload accounts including user's own email from ADDITIONAL_METADATA if matching pattern
  const googleAccountsList = [
    {
      name: 'Akshay Kashyap',
      email: 'akshaykashyap867@gmail.com',
      picture: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Akshay&backgroundColor=b6e3f4'
    },
    {
      name: 'Aarav Mehta',
      email: 'customer@sevasaathi.com',
      picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav&backgroundColor=c0aede'
    },
    {
      name: 'Ramesh Kumar',
      email: 'provider@sevasaathi.com',
      picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh&backgroundColor=d1f4ff'
    }
  ];

  return (
    <div className="w-full">
      {googleClientId ? (
        <div id="real-google-btn-container" className="w-full min-h-[44px]"></div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 font-semibold py-3 px-4 rounded-xl shadow-md transition duration-150 text-sm flex items-center justify-center space-x-3 cursor-pointer select-none active:scale-[0.99] disabled:opacity-50"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>
      )}

      {/* High-Fidelity Simulated Google Account Chooser Modal */}
      {showChooser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            
            {/* Header: Google Styling */}
            <div className="p-6 text-center border-b border-slate-100 relative">
              <button
                type="button"
                onClick={() => {
                  setShowChooser(false);
                  setShowCustomForm(false);
                }}
                className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Google Wordmark (styled) */}
              <div className="flex justify-center items-center space-x-0.5 mb-4 select-none font-bold text-2xl tracking-normal">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
              </div>

              <h3 className="font-sans font-semibold text-lg text-slate-800">
                Choose an account
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                to continue to <span className="font-semibold text-amber-600">SevaSaathi</span>
              </p>
            </div>

            {/* Content Body */}
            <div className="p-5 max-h-[380px] overflow-y-auto space-y-4">
              {!showCustomForm ? (
                <>
                  {/* Account items */}
                  <div className="space-y-1">
                    {googleAccountsList.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => handleSimulatedLogin(account.email, account.name, account.picture)}
                        className="w-full flex items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition duration-150 text-left select-none group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3.5 border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <img
                            src={account.picture}
                            alt={account.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-850 truncate group-hover:text-[#4285F4] transition-colors">
                            {account.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {account.email}
                          </p>
                        </div>
                        <div className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded-full uppercase tracking-wider scale-90">
                          {account.email.includes('provider') ? 'Expert' : account.email.includes('customer') ? 'Customer' : 'Owner'}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(true)}
                      className="w-full flex items-center justify-center py-2.5 px-4 border border-dashed border-slate-200 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 transition bg-slate-50/50 hover:bg-slate-50 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-2" />
                      Use Another Google Account
                    </button>
                  </div>
                </>
              ) : (
                /* Custom Google Account Form */
                <form onSubmit={handleCustomSubmit} className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. yourname@gmail.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#4285F4] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Your Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Akshay Kashyap"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#4285F4] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCustomForm(false)}
                      className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition cursor-pointer"
                    >
                      Back to list
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-[#4285F4] hover:bg-[#357ae8] rounded-xl text-xs font-bold text-white transition cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Authenticate</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <div className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Secure Google OAuth simulation</span>
              </div>
              <div className="flex space-x-3">
                <span className="hover:underline cursor-pointer">Privacy</span>
                <span className="hover:underline cursor-pointer">Terms</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
