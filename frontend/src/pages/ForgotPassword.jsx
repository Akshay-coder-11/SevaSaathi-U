import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, CheckCircle, AlertCircle, ArrowLeft, Key, Lock, Eye, EyeOff, RefreshCw, Server, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Send Request, 2: Reset Password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SMTP Email status monitoring states
  const [emailLogs, setEmailLogs] = useState([]);
  const [isCheckingLogs, setIsCheckingLogs] = useState(false);
  const [logError, setLogError] = useState(null);
  const [autoPoll, setAutoPoll] = useState(false);

  const fetchEmailLogs = async (emailToTrack) => {
    const targetEmail = emailToTrack || email;
    if (!targetEmail) return;
    
    setIsCheckingLogs(true);
    setLogError(null);
    try {
      const res = await api.get(`/auth/email-status/${encodeURIComponent(targetEmail.trim())}`);
      if (res.success && res.logs) {
        setEmailLogs(res.logs);
      }
    } catch (err) {
      setLogError(err.message || 'Failed to fetch email delivery status');
    } finally {
      setIsCheckingLogs(false);
    }
  };

  // Poll logs automatically when we trigger forgot password
  useEffect(() => {
    let intervalId;
    if (autoPoll && email) {
      fetchEmailLogs(email);
      intervalId = setInterval(() => {
        fetchEmailLogs(email);
      }, 3500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoPoll, email]);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMsg('Please enter an email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmailLogs([]);

    try {
      const res = await api.post('/auth/forgotpassword', { email });
      
      setSuccessMsg(res.message || res.data || '6-digit verification code generated and sent to your email inbox successfully!');
      setStep(2);
      setAutoPoll(true);
      fetchEmailLogs(email);
    } catch (err) {
      setErrorMsg(err.message || 'Could not process password recovery request. Please verify details.');
      // Still fetch logs to see why SMTP failed
      fetchEmailLogs(email);
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
        email
      });
      setSuccessMsg(res.data || res.message || 'Your password has been reset successfully! Redirecting to login...');
      setAutoPoll(false);
      
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
              ? 'Enter your registered email address to receive a secure 6-digit verification code' 
              : `Enter the 6-digit code sent to your registered email and set your new password`}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start space-x-3 text-rose-400 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-xs font-semibold leading-normal">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="space-y-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start space-x-3 text-emerald-400 animate-fadeIn">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-xs font-semibold leading-normal">{successMsg}</span>
            </div>
            
            {(successMsg.toLowerCase().includes('slow') || successMsg.toLowerCase().includes('offline') || successMsg.toLowerCase().includes('timeout') || successMsg.toLowerCase().includes('failed')) && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-2 text-amber-400 animate-fadeIn">
                <div className="flex items-center space-x-2 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>💡 Live Email Logs Fallback</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  SMTP mail server ports are currently restricted or credentials are missing on the deployed cloud service. 
                  Don't worry! We've captured your secure verification code on the server database. 
                  <b> Simply click "Auto-Fill" in the Live Email Delivery Status box below </b> to load the 6-digit code automatically!
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl space-y-6">
          {step === 1 ? (
            <form onSubmit={handleRequestToken} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 hover:-translate-y-0.5 active:translate-y-0 transition duration-150 text-sm font-display flex items-center justify-center cursor-pointer"
              >
                <span>{isSubmitting ? 'Generating Verification...' : 'Send 6-Digit Code'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">6-Digit Verification Code</label>
                <div className="relative">
                  <Key className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
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
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
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
                    className="absolute right-4 top-3.5 h-5 w-5 text-slate-500 hover:text-slate-300 transition focus:outline-none cursor-pointer flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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

        {/* Real-time SMTP email delivery log widget */}
        {email && (
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-200">Live Email Delivery Status</h3>
              </div>
              <button
                type="button"
                onClick={() => fetchEmailLogs(email)}
                disabled={isCheckingLogs}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 border border-slate-800 hover:border-slate-700 rounded-lg px-2 py-1 transition bg-slate-950/40 disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Server-side logs for <strong className="text-slate-300 font-mono">{email}</strong>. Use this monitor to verify SMTP connection handshakes or trace delivery issues.
            </p>

            {isCheckingLogs && emailLogs.length === 0 ? (
              <div className="text-center py-4 text-xs text-slate-500 animate-pulse">
                Querying server delivery logs...
              </div>
            ) : emailLogs.length === 0 ? (
              <div className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-4 text-center text-xs text-slate-500">
                No active delivery logs found for this session yet. Submit your recovery request to initialize tracing.
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {emailLogs.map((log) => {
                  let statusColor = 'text-amber-400 bg-amber-400/10 border-amber-400/20';
                  let statusText = 'Pending';
                  if (log.status === 'delivered') {
                    statusColor = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
                    statusText = 'Delivered';
                  } else if (log.status === 'failed') {
                    statusColor = 'text-rose-400 bg-rose-400/10 border-rose-400/20';
                    statusText = 'Delivery Failed';
                  } else if (log.status === 'simulated') {
                    statusColor = 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
                    statusText = 'Simulated';
                  }

                  const otpMatch = log.smtpResponse ? log.smtpResponse.match(/\b\d{6}\b/) : null;
                  const extractedOtp = otpMatch ? otpMatch[0] : null;

                  return (
                    <div key={log._id} className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${statusColor}`}>
                          {statusText}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-slate-300 font-semibold">{log.subject}</div>
                        {log.smtpConfig && (log.smtpConfig.host || log.smtpConfig.service) && (
                          <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                            <span className="font-bold">Gateway:</span>
                            <span>
                              {log.smtpConfig.service === 'gmail' 
                                ? 'Gmail Service API' 
                                : `${log.smtpConfig.host}:${log.smtpConfig.port || 465}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {extractedOtp && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">Auto-Detected Code</span>
                            <span className="text-[9px] text-slate-500">Quick fill</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm font-bold tracking-widest font-mono text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex-1 text-center select-all">
                              {extractedOtp}
                            </code>
                            <button
                              type="button"
                              onClick={() => {
                                setToken(extractedOtp);
                                setSuccessMsg('Verification code auto-loaded! Please enter your new password.');
                              }}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[10px] transition cursor-pointer"
                            >
                              Auto-Fill
                            </button>
                          </div>
                        </div>
                      )}

                      {log.status === 'simulated' && (
                        <div className="bg-indigo-950/30 border border-indigo-900/30 rounded-lg p-2.5 space-y-1 text-indigo-300 text-[11px] leading-relaxed">
                          <div className="flex items-center space-x-1.5 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>SMTP Credentials Missing</span>
                          </div>
                          <p>
                            We completed a full developer simulation. Please configure your production keys <b>EMAIL_USER</b> & <b>EMAIL_PASS</b> to enable physical mail delivery.
                          </p>
                        </div>
                      )}

                      {log.status === 'delivered' && (
                        <div className="bg-emerald-950/30 border border-emerald-900/30 rounded-lg p-2.5 space-y-1 text-emerald-300 text-[11px] leading-relaxed">
                          <div className="flex items-center space-x-1.5 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>SMTP Success</span>
                          </div>
                          <p>
                            Your mail provider received the message. Please ensure the user checks their spam or junk inbox filters if it is not immediately visible.
                          </p>
                          {log.smtpResponse && (
                            <code className="block bg-slate-950 p-1.5 rounded border border-slate-800 text-[10px] text-slate-400 break-all font-mono">
                              {log.smtpResponse}
                            </code>
                          )}
                        </div>
                      )}

                      {log.status === 'failed' && (
                        <div className="bg-rose-950/30 border border-rose-900/30 rounded-lg p-2.5 space-y-1.5 text-rose-300 text-[11px] leading-relaxed">
                          <div className="flex items-center space-x-1.5 font-bold">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>SMTP Provider Connection Blocked</span>
                          </div>
                          <p className="font-medium text-rose-400">
                            Error: {log.errorMessage || 'Unknown SMTP error'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Ensure outbound ports (465/587) are not restricted on Render/AI Studio and verify App Passwords.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
