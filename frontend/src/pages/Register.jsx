import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('customer'); // customer, provider, admin
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  
  // Structured Registration Address States
  const [regHouseNo, setRegHouseNo] = useState('');
  const [regApartment, setRegApartment] = useState('');
  const [regStreet, setRegStreet] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('Uttar Pradesh');
  const [regCountry, setRegCountry] = useState('India');
  const [regPincode, setRegPincode] = useState('');
  
  // Provider Specific States
  const [category, setCategory] = useState('Electrician');
  const [rate, setRate] = useState('');
  const [skills, setSkills] = useState('');
  const [bio, setBio] = useState('');

  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      setErrorMsg('Please populate all mandatory fields (*).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const providerDetails = role === 'provider' ? {
      category,
      rate: Number(rate) || 200,
      bio: bio || `Expert ${category} solutions.`,
      skills: skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : []
    } : undefined;

    const compiledAddress = [
      regHouseNo.trim() ? `House/Flat: ${regHouseNo.trim()}` : '',
      regApartment.trim() ? `Apartment: ${regApartment.trim()}` : '',
      regStreet.trim() ? `Street/Area: ${regStreet.trim()}` : '',
      regCity.trim() ? `City: ${regCity.trim()}` : '',
      regState.trim() ? `State: ${regState.trim()}` : '',
      regCountry.trim() ? `Country: ${regCountry.trim()}` : '',
      regPincode.trim() ? `Pincode: ${regPincode.trim()}` : ''
    ].filter(Boolean).join(', ');

    try {
      await register({
        name,
        email,
        password,
        role,
        phone,
        address: compiledAddress,
        providerDetails
      });

      setSuccessMsg('Registration completed successfully! Directing you to your workspace...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please review values.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        
        {/* Title */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/10 mb-4 animate-pulse">
            <Sparkles className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="font-display font-extrabold text-3xl tracking-tight text-white">
            Create Account
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Join India's smart doorstep support network
          </p>
        </div>

        {/* Banners */}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Role Selector Tabs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Join SevaSaathi as</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition duration-150 cursor-pointer ${
                    role === 'customer'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('provider')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition duration-150 cursor-pointer ${
                    role === 'provider'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Service Expert
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition duration-150 cursor-pointer ${
                    role === 'admin'
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Inputs Scrollbox */}
            <div className="grid grid-cols-1 gap-3.5 max-h-[350px] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Mehta"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-700 text-sm focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aarav@mail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-700 text-sm focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 pl-4 pr-11 text-slate-200 placeholder-slate-700 text-sm focus:outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 h-5 w-5 text-slate-500 hover:text-slate-300 transition focus:outline-none cursor-pointer flex items-center justify-center"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-slate-200 placeholder-slate-700 text-sm focus:outline-none transition"
                />
              </div>

              <div className="space-y-3 p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                <span className="text-[10px] text-amber-500 uppercase font-mono font-bold block mb-1">📍 Primary Home Address Setup</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">House/Flat No</label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 102"
                      value={regHouseNo}
                      onChange={(e) => setRegHouseNo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">Apartment/Society</label>
                    <input
                      type="text"
                      placeholder="e.g. Sunrise Heights"
                      value={regApartment}
                      onChange={(e) => setRegApartment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">Street / Sector / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Sector 62, Near Park"
                    value={regStreet}
                    onChange={(e) => setRegStreet(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Noida"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">Pincode</label>
                    <input
                      type="text"
                      placeholder="e.g. 201301"
                      value={regPincode}
                      onChange={(e) => setRegPincode(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">State</label>
                    <select
                      value={regState}
                      onChange={(e) => setRegState(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {['Uttar Pradesh', 'Delhi', 'Haryana', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan', 'Bihar', 'Punjab'].map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">Country</label>
                    <select
                      value={regCountry}
                      onChange={(e) => setRegCountry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {['India', 'United States', 'United Arab Emirates', 'United Kingdom', 'Canada', 'Australia'].map(cntry => (
                        <option key={cntry} value={cntry}>{cntry}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Service Provider Expert Profile Specifics */}
              {role === 'provider' && (
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Expert Settings Profile</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Main Category</label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-slate-200 text-sm focus:outline-none"
                      >
                        <option>Electrician</option>
                        <option>Plumber</option>
                        <option>Mechanic</option>
                        <option>Cook / Chef</option>
                        <option>Cleaner / Maid</option>
                        <option>Painter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Hourly Rate (₹/hr)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 299"
                        value={rate}
                        onChange={e => setRate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-slate-200 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Core Skills (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Wiring, AC installation, home service"
                      value={skills}
                      onChange={e => setSkills(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-4 text-slate-200 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Short professional bio</label>
                    <textarea
                      placeholder="e.g. Background certified technician with 5+ years of appliance wiring fixes..."
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-4 text-slate-200 text-sm focus:outline-none h-16 resize-none"
                    />
                  </div>
                </div>
              )}

            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 active:translate-y-0 transition duration-150 text-sm font-display flex items-center justify-center space-x-2 cursor-pointer mt-3"
            >
              <span>{isSubmitting ? 'Creating Account Profile...' : 'Create Account'}</span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="text-center">
            <span className="text-slate-500 text-xs">Already have an account? </span>
            <Link
              to="/login"
              className="text-amber-500 hover:text-amber-400 text-xs font-semibold transition"
            >
              Sign in here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
