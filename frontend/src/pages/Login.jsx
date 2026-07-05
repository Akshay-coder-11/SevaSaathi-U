import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const user = await login(email, password);
      setSuccessMsg(`Welcome back, ${user.name}! Directing to your workspace...`);
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
      setIsSubmitting(false);
    }
  };

  const setDemoCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        
        {/* Title */}
        <div className="text-center">
          <h2 className="font-display font-extrabold text-3xl tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to access your SevaSaathi service dashboard
          </p>
        </div>

        {/* Alert Card Banners */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start space-x-3 text-rose-400">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold leading-normal">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start space-x-3 text-emerald-400">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold leading-normal">{successMsg}</span>
          </div>
        )}

        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="e.g. customer@sevasaathi.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pl-12 pr-12 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 h-4.5 w-4.5 text-slate-500 hover:text-slate-300 transition focus:outline-none cursor-pointer flex items-center justify-center"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0 transition duration-150 text-sm font-display flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Sign In'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="relative flex py-1.5 items-center">
            <div className="flex-grow border-t border-slate-850"></div>
            <span className="flex-shrink mx-3 text-slate-500 text-[10px] font-bold uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-slate-850"></div>
          </div>

          <GoogleSignInButton
            role="customer"
            onAuthSuccess={(user) => {
              setSuccessMsg(`Welcome back, ${user.name}! Authenticating via Google...`);
              setTimeout(() => {
                navigate(redirectPath, { replace: true });
              }, 1000);
            }}
            onAuthError={(msg) => setErrorMsg(msg)}
          />

          <div className="text-center">
            <span className="text-slate-500 text-xs">Don't have an account? </span>
            <Link
              to="/register"
              className="text-amber-500 hover:text-amber-400 text-xs font-semibold transition"
            >
              Sign up here
            </Link>
          </div>
        </div>

        {/* Preloaded Demo accounts */}
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 text-center text-xs space-y-2.5">
          <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Select Preloaded Account for Demo Assessment</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setDemoCredentials('customer@sevasaathi.com', 'customer123')}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition"
            >
              Customer
            </button>
            <button
              onClick={() => setDemoCredentials('provider@sevasaathi.com', 'provider123')}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition"
            >
              Service Provider
            </button>
            <button
              onClick={() => setDemoCredentials('admin@sevasaathi.com', 'admin123')}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 py-1.5 px-2.5 rounded-lg text-[11px] font-medium transition"
            >
              Administrator
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
