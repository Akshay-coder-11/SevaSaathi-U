import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, Phone, CheckCircle, AlertCircle, ArrowLeft, Key, Lock, Eye, EyeOff } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Send Request, 2: Reset Password
  const [method, setMethod] = useState('email'); // 'email' or 'phone'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoTokenHint, setDemoTokenHint] = useState(null);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    
    if (method === 'email' && !email) {
      setErrorMsg('Please enter an email address.');
      return;
    }
    if (method === 'phone' && !phone) {
      setErrorMsg('Please enter your registered mobile number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setDemoTokenHint(null);

    try {
      const payload = method === 'email' ? { email } : { phone };
      const res = await api.post('/auth/forgotpassword', payload);
      
      // Keep track of any token sent back for ease of testing & 100% reliability
      if (res.token) {
        setDemoTokenHint(res.token);
        setToken(res.token);
      }
      
      setSuccessMsg(res.message || res.data || '6-digit verification code generated successfully!');
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Could not process password recovery request. Please verify details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.put(`/auth/resetpassword/${token}`, { 
        password: newPassword, 
        email: method === 'email' ? email : undefined,
        phone: method === 'phone' ? phone : undefined
      });
      setSuccessMsg(res.data || res.message || 'Your password has been reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        
        <div className="text-center">
          <h2 className="font-display font-extrabold text-3xl tracking-tight text-white">
            {step === 1 ? 'Recover Password' : 'Reset Your Password'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {step === 1 
              ? 'Choose recovery option to receive a 6-digit secure code' 
              : `Enter the 6-digit code sent to your registered ${method === 'email' ? 'email' : 'phone number'} and set your new password`}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start space-x-3 text-rose-400 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold leading-normal">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start space-x-3 text-emerald-400 animate-fadeIn">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold leading-normal">{successMsg}</span>
          </div>
        )}

        {demoTokenHint && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-400 text-xs font-medium space-y-1 animate-fadeIn">
            <p className="font-bold">✨ Recovery Assistant Code:</p>
            <p>Since delivery depends on live networks, here is your 6-digit code for 100% instant testing: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-white border border-slate-800 font-mono tracking-wider">{demoTokenHint}</code></p>
          </div>
        )}

        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl space-y-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMethod('email');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                    method === 'email'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMethod('phone');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer ${
                    method === 'phone'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Phone Number</span>
                </button>
              </div>

              <form onSubmit={handleRequestToken} className="space-y-5">
                {method === 'email' ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Registered Email Address</label>
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
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Registered Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. 9876543210"
                        value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm transition"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 hover:-translate-y-0.5 active:translate-y-0 transition duration-150 text-sm font-display flex items-center justify-center cursor-pointer"
                >
                  <span>{isSubmitting ? 'Generating Verification...' : 'Send 6-Digit Code'}</span>
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">6-Digit Verification Code</label>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={token}
                    onChange={e => setToken(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm tracking-widest font-mono font-bold transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-amber-500 rounded-xl py-3 pl-12 pr-12 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 h-4.5 w-4.5 text-slate-500 hover:text-slate-300 transition focus:outline-none cursor-pointer flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 hover:-translate-y-0.5 active:translate-y-0 transition duration-150 text-sm font-display flex items-center justify-center cursor-pointer"
              >
                <span>{isSubmitting ? 'Resetting Password...' : 'Update Password'}</span>
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setDemoTokenHint(null);
                  }}
                  className="text-slate-400 hover:text-white text-xs font-semibold underline transition cursor-pointer"
                >
                  Resend Code / Try another option
                </button>
              </div>
            </form>
          )}

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-slate-400 hover:text-white text-xs font-semibold inline-flex items-center space-x-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
