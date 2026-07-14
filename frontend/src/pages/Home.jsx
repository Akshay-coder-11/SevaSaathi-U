import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Logo from '../components/Logo';
import { 
  Sparkles, ShieldCheck, UserCheck, Search, Star, Clock, MapPin, 
  CheckCircle2, DollarSign, Users, Briefcase, PlusCircle, Send, AlertTriangle,
  ArrowRight, Shield, Award, HeartHandshake, CheckCircle, Flame, UserPlus,
  Bot, Cpu, Zap, Calendar, Camera, Key, Mail, Phone, User, Upload, FileText
} from 'lucide-react';

const SERVICE_CATEGORIES = [
  { name: 'Electrician', icon: '⚡', desc: 'Wiring, switches & appliance repair' },
  { name: 'Plumber', icon: '🚰', desc: 'Leaky pipes, basin fixes & drainage' },
  { name: 'Mechanic', icon: '🔧', desc: 'Car, bike tuning & vehicle inspection' },
  { name: 'Cook / Chef', icon: '🍳', desc: 'Daily cooking, party meals & catering' },
  { name: 'Cleaner / Maid', icon: '🧹', desc: 'Deep house cleaning & dusting' },
  { name: 'Painter', icon: '🎨', desc: 'Wall coatings, stains & wall paint' },
  { name: 'Mistri (Mason)', icon: '🧱', desc: 'Brickwork, plastering, tiles & construction' },
  { name: 'Labour (Helper)', icon: '💪', desc: 'General help, lifting, shifting & support' }
];

// Custom point-wise text and list formatting renderer similar to ChatGPT markdown lists
function PointWiseRenderer({ text }) {
  if (!text) return null;

  // Split by double newlines to handle paragraphs
  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-3">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n');
        
        // Determine if this paragraph represents a list block
        const isList = lines.every(line => {
          const trimmed = line.trim();
          return trimmed === '' || trimmed.startsWith('*') || trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed);
        }) || (lines.length > 1 && lines.some(line => {
          const trimmed = line.trim();
          return trimmed.startsWith('*') || trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed);
        }));

        if (isList) {
          return (
            <ul key={pIdx} className="list-none space-y-2.5 my-3 pl-1">
              {lines.map((line, lIdx) => {
                const trimmed = line.trim();
                if (!trimmed) return null;

                let content = trimmed;
                let isNumbered = false;
                let numberPrefix = '';

                if (content.startsWith('*')) {
                  content = content.replace(/^\*\s*/, '');
                } else if (content.startsWith('-')) {
                  content = content.replace(/^-\s*/, '');
                } else if (content.startsWith('•')) {
                  content = content.replace(/^•\s*/, '');
                } else {
                  const match = content.match(/^(\d+)\.\s*/);
                  if (match) {
                    isNumbered = true;
                    numberPrefix = match[1];
                    content = content.replace(/^\d+\.\s*/, '');
                  }
                }

                const formatBoldText = (str) => {
                  const parts = str.split('**');
                  return parts.map((part, index) => {
                    if (index % 2 === 1) {
                      return <strong key={index} className="font-extrabold text-amber-400">{part}</strong>;
                    }
                    return part;
                  });
                };

                return (
                  <li key={lIdx} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                    {isNumbered ? (
                      <span className="text-amber-400 font-black font-mono text-xs shrink-0 mt-0.5 min-w-[18px] text-left">
                        {numberPrefix}.
                      </span>
                    ) : (
                      <span className="text-amber-500 shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    )}
                    <span className="flex-1">{formatBoldText(content)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        const formatBoldText = (str) => {
          const parts = str.split('**');
          return parts.map((part, index) => {
            if (index % 2 === 1) {
              return <strong key={index} className="font-extrabold text-amber-400">{part}</strong>;
            }
            return part;
          });
        };

        return (
          <p key={pIdx} className="text-xs text-slate-200 leading-relaxed">
            {formatBoldText(para)}
          </p>
        );
      })}
    </div>
  );
}

export default function Home() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // If logged in, we support different views based on role
  // Default tab based on role
  const getInitialTab = () => {
    if (!user) return 'landing';
    if (user.role === 'customer') return 'browse';
    if (user.role === 'provider') return 'jobs';
    if (user.role === 'admin') return 'users';
    return 'browse';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());

  const prevUserIdRef = useRef(null);
  useEffect(() => {
    const currentId = user ? (user.id || user._id) : null;
    if (currentId && currentId !== prevUserIdRef.current) {
      setActiveTab(getInitialTab());
    }
    prevUserIdRef.current = currentId;
  }, [user]);

  // Common Notification State
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Profile and DP States
  const [uploadingDp, setUploadingDp] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    address: '',
    category: '',
    rate: '',
    bio: '',
    skills: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Populate form fields when user state is loaded or changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        category: user.providerDetails?.category || 'Electrician',
        rate: user.providerDetails?.rate || 200,
        bio: user.providerDetails?.bio || '',
        skills: Array.isArray(user.providerDetails?.skills) ? user.providerDetails.skills.join(', ') : ''
      });
    }
  }, [user]);

  // 1. CUSTOMER DASHBOARD STATE
  const [selectedCategory, setSelectedCategory] = useState('Electrician');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [bookingHours, setBookingHours] = useState(2);
  const [bookingDurationMinutes, setBookingDurationMinutes] = useState(0);
  const [bookingInstructions, setBookingInstructions] = useState('');
  const [bookingAddress, setBookingAddress] = useState(user?.address || '');
  
  // Structured Address States for specific expert booking
  const [bookingHouseNo, setBookingHouseNo] = useState('');
  const [bookingApartment, setBookingApartment] = useState('');
  const [bookingStreet, setBookingStreet] = useState('');
  const [bookingCity, setBookingCity] = useState('Noida');
  const [bookingState, setBookingState] = useState('Uttar Pradesh');
  const [bookingCountry, setBookingCountry] = useState('India');
  const [bookingPincode, setBookingPincode] = useState('201301');
  
  // Custom booking enhancements (Date, Time & Emergency toggles)
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('12:00');
  const [isEmergencyBooking, setIsEmergencyBooking] = useState(false);

  // Broadcast Booking state (Open requests for nearby providers)
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [broadcastCategory, setBroadcastCategory] = useState('Electrician');
  const [broadcastHours, setBroadcastHours] = useState(2);
  const [broadcastDurationMinutes, setBroadcastDurationMinutes] = useState(0);
  const [broadcastInstructions, setBroadcastInstructions] = useState('');
  const [broadcastAddress, setBroadcastAddress] = useState(user?.address || '');
  
  // Structured Address States for broadcast bookings
  const [broadcastHouseNo, setBroadcastHouseNo] = useState('');
  const [broadcastApartment, setBroadcastApartment] = useState('');
  const [broadcastStreet, setBroadcastStreet] = useState('');
  const [broadcastCity, setBroadcastCity] = useState('Noida');
  const [broadcastState, setBroadcastState] = useState('Uttar Pradesh');
  const [broadcastCountry, setBroadcastCountry] = useState('India');
  const [broadcastPincode, setBroadcastPincode] = useState('201301');
  const [broadcastDate, setBroadcastDate] = useState(new Date().toISOString().split('T')[0]);
  const [broadcastTime, setBroadcastTime] = useState('12:00');
  const [broadcastIsEmergency, setBroadcastIsEmergency] = useState(true);

  // Live GPS tracking simulator state
  const [trackedBookingId, setTrackedBookingId] = useState(null);
  const [trackingDistance, setTrackingDistance] = useState(1800); // meters
  const [trackingEta, setTrackingEta] = useState(15); // minutes
  const [trackingStep, setTrackingStep] = useState(1); // 1 = Assigned, 2 = Dispatched, 3 = Heading Over, 4 = Nearby (200m), 5 = At Doorstep
  
  // Simulated Local Storage Database for Demo MVP State
  const [experts, setExperts] = useState([
    // Electricians
    { id: 'prov_1', name: 'Ramesh Kumar', role: 'provider', email: 'ramesh@sevasaathi.com', phone: '9812345678', address: 'Sector 15, Noida', providerDetails: { category: 'Electrician', rate: 299, rating: 4.8, ratingsCount: 15, isVerified: true, availability: 'available', completedJobs: 42, earnings: 12500, bio: 'Expert certified residential electrician with 8+ years experience.', skills: ['Wiring', 'AC installation', 'Mainboard Repair'] } },
    { id: 'prov_1_2', name: 'Amit Mishra', role: 'provider', email: 'amit@sevasaathi.com', phone: '9812345612', address: 'Sector 62, Noida', providerDetails: { category: 'Electrician', rate: 249, rating: 4.9, ratingsCount: 34, isVerified: true, availability: 'available', completedJobs: 89, earnings: 25000, bio: 'Top rated domestic electrician specializing in appliance repairs & house wiring.', skills: ['Appliance Repair', 'House Wiring', 'Short Circuit Fix'] } },
    { id: 'prov_1_3', name: 'Sandeep Verma', role: 'provider', email: 'sandeep@sevasaathi.com', phone: '9812345634', address: 'Sector 18, Noida', providerDetails: { category: 'Electrician', rate: 199, rating: 4.3, ratingsCount: 9, isVerified: false, availability: 'busy', completedJobs: 15, earnings: 3000, bio: 'Affordable handyman electrician for quick switch fixes & fuse wiring.', skills: ['Fuse Repair', 'Inverter Battery setup', 'Switch installation'] } },

    // Cooks
    { id: 'prov_2', name: 'Sunita Sharma', role: 'provider', email: 'sunita@sevasaathi.com', phone: '9823456789', address: 'Indirapuram, Ghaziabad', providerDetails: { category: 'Cook / Chef', rate: 199, rating: 4.9, ratingsCount: 22, isVerified: true, availability: 'available', completedJobs: 85, earnings: 18900, bio: 'Home cook specializing in healthy North & South Indian meals.', skills: ['North Indian', 'South Indian', 'Baking'] } },
    { id: 'prov_2_2', name: 'Preeti Devi', role: 'provider', email: 'preeti@sevasaathi.com', phone: '9823456711', address: 'Sector 50, Noida', providerDetails: { category: 'Cook / Chef', rate: 150, rating: 4.6, ratingsCount: 12, isVerified: false, availability: 'available', completedJobs: 24, earnings: 3600, bio: 'Local expert in traditional homestyle chapati, sabzi & regional cuisines.', skills: ['Chapatis', 'Gujarati dishes', 'Veg curries'] } },
    { id: 'prov_2_3', name: 'Chef Rajesh Khanna', role: 'provider', email: 'rajeshchef@sevasaathi.com', phone: '9823456722', address: 'Vasant Kunj, Delhi', providerDetails: { category: 'Cook / Chef', rate: 350, rating: 4.8, ratingsCount: 40, isVerified: true, availability: 'busy', completedJobs: 112, earnings: 39000, bio: 'Professional multi-cuisine chef for premium events, dinner parties and catering.', skills: ['Continental', 'Tandoor special', 'Chinese cuisine'] } },

    // Plumbers
    { id: 'prov_3', name: 'Vikram Singh', role: 'provider', email: 'vikram@sevasaathi.com', phone: '9834567890', address: 'Vasant Kunj, Delhi', providerDetails: { category: 'Plumber', rate: 249, rating: 4.5, ratingsCount: 8, isVerified: false, availability: 'available', completedJobs: 12, earnings: 3200, bio: 'Experienced plumber for emergency water blockages and pipe routing.', skills: ['Fitting', 'Water Heaters', 'Leak repair'] } },
    { id: 'prov_3_2', name: 'Rajinder Prasad', role: 'provider', email: 'rajinder@sevasaathi.com', phone: '9834567811', address: 'Indirapuram, Ghaziabad', providerDetails: { category: 'Plumber', rate: 180, rating: 4.7, ratingsCount: 16, isVerified: true, availability: 'available', completedJobs: 38, earnings: 6840, bio: 'Honest and certified plumber specializing in tap fixes, drainage clearing & sanitary fittings.', skills: ['Tap Leaks', 'Sanitary Fitting', 'Drainage Cleaning'] } },
    { id: 'prov_3_3', name: 'Manoj Tiwari', role: 'provider', email: 'manoj@sevasaathi.com', phone: '9834567822', address: 'Sector 45, Noida', providerDetails: { category: 'Plumber', rate: 300, rating: 4.9, ratingsCount: 29, isVerified: true, availability: 'busy', completedJobs: 74, earnings: 22200, bio: 'Senior master plumber. Heavy industrial fittings, geyser breakdowns, and full pipe layouts.', skills: ['Geyser Repair', 'Pipeline Installation', 'Water Pressure Pumps'] } },

    // Mechanics
    { id: 'prov_4', name: 'Anil Gupta', role: 'provider', email: 'anil@sevasaathi.com', phone: '9845678901', address: 'Dwarka, Delhi', providerDetails: { category: 'Mechanic', rate: 349, rating: 4.7, ratingsCount: 19, isVerified: true, availability: 'busy', completedJobs: 56, earnings: 21000, bio: 'Certified car technician with expertise in multi-brand engine tuning.', skills: ['Car Diagnostics', 'Engine Tuning', 'Brakes'] } },
    { id: 'prov_4_2', name: 'Gurpreet Singh', role: 'provider', email: 'gurpreet@sevasaathi.com', phone: '9845678922', address: 'Sector 62, Noida', providerDetails: { category: 'Mechanic', rate: 299, rating: 4.9, ratingsCount: 31, isVerified: true, availability: 'available', completedJobs: 82, earnings: 24500, bio: 'Expert bike & car mechanic. On-the-spot breakdowns, engine tuning and filter replacements.', skills: ['Bike Engine Repair', 'Oil Filtering', 'Brake Pads'] } },

    // Painters
    { id: 'prov_5', name: 'Suresh Pal', role: 'provider', email: 'suresh@sevasaathi.com', phone: '9856789012', address: 'Sector 62, Noida', providerDetails: { category: 'Painter', rate: 220, rating: 4.6, ratingsCount: 11, isVerified: true, availability: 'available', completedJobs: 28, earnings: 8400, bio: 'Professional wall painting, house coatings, texture finishes & exterior weather shield coatings.', skills: ['Wall Painting', 'Texture Work', 'Exterior Shield'] } },
    { id: 'prov_5_2', name: 'Ajay Sharma', role: 'provider', email: 'ajaypainter@sevasaathi.com', phone: '9856789033', address: 'Indirapuram, Ghaziabad', providerDetails: { category: 'Painter', rate: 190, rating: 4.4, ratingsCount: 8, isVerified: false, availability: 'available', completedJobs: 14, earnings: 2600, bio: 'Budget home painting solutions, distemper coat, and rich wood polish.', skills: ['Distemper Coating', 'Wood Polishing', 'Putty Finish'] } },

    // Masons
    { id: 'prov_6', name: 'Ram Ashrey', role: 'provider', email: 'ramashrey@sevasaathi.com', phone: '9867890123', address: 'Indirapuram, Ghaziabad', providerDetails: { category: 'Mistri (Mason)', rate: 399, rating: 4.7, ratingsCount: 18, isVerified: true, availability: 'available', completedJobs: 34, earnings: 14500, bio: 'Civil masonry expert. Specialized in vitrified tile layouts, brick construction, plastering, and leak dampness proofing.', skills: ['Tile Fitting', 'Wall Plastering', 'Brickwork'] } },
    { id: 'prov_6_2', name: 'Kamal Dev', role: 'provider', email: 'kamal@sevasaathi.com', phone: '9867890144', address: 'Sector 15, Noida', providerDetails: { category: 'Mistri (Mason)', rate: 350, rating: 4.5, ratingsCount: 10, isVerified: false, availability: 'available', completedJobs: 19, earnings: 6650, bio: 'Skilled civil mason for concrete works, lintels, plaster, and brick wall extensions.', skills: ['Concrete Works', 'Brick Plastering', 'Wall Building'] } },

    // Helpers
    { id: 'prov_7', name: 'Chhotu Lal', role: 'provider', email: 'chhotu@sevasaathi.com', phone: '9878901234', address: 'Sector 15, Noida', providerDetails: { category: 'Labour (Helper)', rate: 149, rating: 4.6, ratingsCount: 29, isVerified: true, availability: 'available', completedJobs: 67, earnings: 11200, bio: 'Strong and dependable helper for shifting house luggages, loading/unloading vehicles, clearing debris, and general manual tasks.', skills: ['Heavy Shifting', 'Construction Assistance', 'Vehicle Loading'] } },
    { id: 'prov_7_2', name: 'Mukesh Yadav', role: 'provider', email: 'mukesh@sevasaathi.com', phone: '9878901255', address: 'Sector 62, Noida', providerDetails: { category: 'Labour (Helper)', rate: 130, rating: 4.3, ratingsCount: 14, isVerified: false, availability: 'available', completedJobs: 22, earnings: 2860, bio: 'Hardworking manual assistant for site cleaning, shifting items, garden support.', skills: ['Lifting Shifting', 'Site Clearing', 'Garden support'] } },

    // Cleaners
    { id: 'prov_8_1', name: 'Geeta Bai', role: 'provider', email: 'geeta@sevasaathi.com', phone: '9889012301', address: 'Sector 22, Noida', providerDetails: { category: 'Cleaner / Maid', rate: 120, rating: 4.8, ratingsCount: 45, isVerified: true, availability: 'available', completedJobs: 142, earnings: 17040, bio: 'Most reliable domestic housekeeper. Deep flat cleaning, kitchen scrubbing & daily mopping.', skills: ['Kitchen Scrubbing', 'Deep Flat Cleaning', 'Bathroom Wash'] } },
    { id: 'prov_8_2', name: 'Seema Sahu', role: 'provider', email: 'seema@sevasaathi.com', phone: '9889012302', address: 'Sector 34, Noida', providerDetails: { category: 'Cleaner / Maid', rate: 110, rating: 4.5, ratingsCount: 14, isVerified: false, availability: 'available', completedJobs: 30, earnings: 3300, bio: 'Detail-oriented cleaner. Furniture dusting, vacuum cleaning and washing utensils.', skills: ['Dusting', 'Utensils Washing', 'Vacuum cleaning'] } }
  ]);

  const [bookings, setBookings] = useState([
    { id: 'b_101', customerName: 'Aarav Mehta', customerPhone: '9876543210', expertId: 'prov_1', expertName: 'Ramesh Kumar', category: 'Electrician', hours: 3, minutes: 0, cost: 897, instructions: 'AC switch is sparkling occasionally.', address: 'Sector 62, Noida', status: 'In Progress', date: '2026-07-03', time: '14:30', isEmergency: false, isBroadcast: false },
    { id: 'b_102', customerName: 'Aarav Mehta', customerPhone: '9876543210', expertId: 'prov_2', expertName: 'Sunita Sharma', category: 'Cook / Chef', hours: 2, minutes: 30, cost: 497, instructions: 'Need 5 dishes for simple weekend lunch.', address: 'Sector 62, Noida', status: 'Pending', date: '2026-07-04', time: '11:00', isEmergency: false, isBroadcast: false }
  ]);

  // Simulated real-time tracking decrement effect
  useEffect(() => {
    if (!trackedBookingId) return;

    const currentBooking = bookings.find(b => b.id === trackedBookingId);
    const startDistance = currentBooking?.isEmergency ? 850 : 2200;
    const startEta = currentBooking?.isEmergency ? 12 : 28;

    setTrackingDistance(startDistance);
    setTrackingEta(startEta);
    setTrackingStep(1);

    const interval = setInterval(() => {
      setTrackingDistance(prev => {
        if (prev <= 40) {
          setTrackingStep(5);
          setTrackingEta(0);
          return 0;
        }

        const decrement = Math.floor(Math.random() * 140) + 80; // Decrement 80-220 meters
        const nextDist = Math.max(0, prev - decrement);

        if (nextDist > 1600) {
          setTrackingStep(2); // Dispatched
        } else if (nextDist > 700) {
          setTrackingStep(3); // Heading Over
        } else if (nextDist > 100) {
          setTrackingStep(4); // Nearby (200m)
        } else {
          setTrackingStep(5); // Arrived
        }

        setTrackingEta(Math.ceil(nextDist / 130));
        return nextDist;
      });
    }, 4000); // Update every 4 seconds

    return () => clearInterval(interval);
  }, [trackedBookingId, bookings]);

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: 'Namaste! I am SevaSaathi Assistant, your intelligent local service companion. How can I assist you with plumbing, electrical, cooking, painting, masonry (mistri), or labour helper bookings today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Address Inputs
  const [addressHouseNo, setAddressHouseNo] = useState('');
  const [addressApartment, setAddressApartment] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('Uttar Pradesh');
  const [addressCountry, setAddressCountry] = useState('India');
  const [addressZip, setAddressZip] = useState('');

  // 2. PROVIDER STATE
  const [providerAvailability, setProviderAvailability] = useState(user?.providerDetails?.availability || 'available');

  // Load bookings and data from server if possible, else fall back to local
  useEffect(() => {
    setBookingAddress(user?.address || '');
    if (user?.address) {
      setBookingStreet(user.address);
      setBroadcastStreet(user.address);
    }
    if (user?.role === 'provider') {
      setProviderAvailability(user.providerDetails?.availability || 'available');
    }
  }, [user]);

  // Fetch users and experts when admin logs in
  useEffect(() => {
    if (user && user.role === 'admin') {
      const fetchAdminData = async () => {
        try {
          const res = await api.get('/user/admin/users');
          if (res.success && res.users) {
            // Update users state by merging database users with mock users
            setUsers(prevUsers => {
              const merged = [...prevUsers];
              res.users.forEach(dbUser => {
                const idx = merged.findIndex(u => u.email === dbUser.email);
                if (idx !== -1) {
                  // Update existing user with database values
                  merged[idx] = { ...merged[idx], ...dbUser, id: dbUser.id || dbUser._id || merged[idx].id };
                } else {
                  // Add new user
                  merged.push(dbUser);
                }
              });
              return merged;
            });

            // Update experts state to include newly registered providers
            setExperts(prevExperts => {
              const merged = [...prevExperts];
              res.users.forEach(dbUser => {
                if (dbUser.role === 'provider') {
                  const idx = merged.findIndex(exp => exp.email === dbUser.email);
                  // Ensure providerDetails exist
                  const dbDetails = dbUser.providerDetails || {
                    category: 'Electrician', // Default fallback category
                    skills: [],
                    rate: 200,
                    rating: 5.0,
                    ratingsCount: 0,
                    isVerified: false,
                    availability: 'available',
                    completedJobs: 0,
                    earnings: 0,
                    bio: 'Registered service expert.'
                  };
                  const expertObj = {
                    id: dbUser.id || dbUser._id,
                    _id: dbUser.id || dbUser._id,
                    name: dbUser.name,
                    role: 'provider',
                    email: dbUser.email,
                    phone: dbUser.phone || '',
                    address: dbUser.address || '',
                    providerDetails: dbDetails
                  };

                  if (idx !== -1) {
                    // Update existing
                    merged[idx] = { ...merged[idx], ...expertObj };
                  } else {
                    // Add new
                    merged.push(expertObj);
                  }
                }
              });
              return merged;
            });
          }
        } catch (err) {
          console.error("Could not fetch admin data:", err);
        }
      };
      fetchAdminData();
    }
  }, [user]);

  // Fetch public registered providers from database for guests/customers
  useEffect(() => {
    const fetchPublicProviders = async () => {
      try {
        const res = await api.get('/user/providers');
        if (res.success && res.providers) {
          setExperts(prevExperts => {
            const merged = [...prevExperts];
            res.providers.forEach(dbProv => {
              const idx = merged.findIndex(exp => exp.email === dbProv.email);
              if (idx !== -1) {
                merged[idx] = { ...merged[idx], ...dbProv, id: dbProv.id || dbProv._id || merged[idx].id };
              } else {
                merged.unshift(dbProv); // Show real newly registered ones at the top/first!
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.error("Could not fetch public providers:", err);
      }
    };
    fetchPublicProviders();
  }, []);

  // Chat Submission Handler (Using real API endpoint with robust fallback!)
  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setAiLoading(true);

    try {
      // Connect to the real Gemini AI assistant route in backend
      const res = await api.post('/ai/assistant', {
        messages: [...chatMessages, { sender: 'user', text: userMsg }]
      });
      
      const botReply = res.response || "I am connected! Let me know what you need help with.";
      setChatMessages(prev => [...prev, { sender: 'assistant', text: botReply }]);
    } catch (err) {
      // Intelligently fallback locally to guide the user seamlessly in real-time
      let aiResponse = "";
      const lower = userMsg.toLowerCase();

      if (lower.includes('spark') || lower.includes('electricity') || lower.includes('wire') || lower.includes('bijli')) {
        aiResponse = "⚠️ Warning: Sparking wires pose a serious fire hazard. I highly recommend booking our certified **Electrician** immediately. Ramesh Kumar is our top-rated Electrician near Noida starting at ₹299/hr. Avoid touching the socket until help arrives!";
      } else if (lower.includes('pipe') || lower.includes('leak') || lower.includes('water') || lower.includes('tap') || lower.includes('pani')) {
        aiResponse = "💧 Pipe leaks can cause wall dampness. You should book **Vikram Singh (Plumber)** at ₹249/hr. For a temporary fix, locate your main household water control valve and rotate it clockwise to shut down supply.";
      } else if (lower.includes('cook') || lower.includes('food') || lower.includes('dinner') || lower.includes('rasoi') || lower.includes('chef')) {
        aiResponse = "🍳 For nutritious domestic meals, **Sunita Sharma (Cook)** is available today for ₹199/hr. She specializes in South & North Indian hygienic home foods.";
      } else if (lower.includes('paint') || lower.includes('painter') || lower.includes('wall') || lower.includes('color')) {
        aiResponse = "🎨 Looking to paint your home? **Suresh Pal (Painter)** is our registered specialist at ₹220/hr, expert in interior wall coatings and exterior weather protection.";
      } else if (lower.includes('mistri') || lower.includes('mason') || lower.includes('brick') || lower.includes('tile')) {
        aiResponse = "🧱 For masonry, civil work, or plastering, **Ram Ashrey (Mistri)** is available at ₹399/hr. He has over 10 years of experience in high-finish vitrified tile installation.";
      } else if (lower.includes('labour') || lower.includes('helper') || lower.includes('lift') || lower.includes('shifting')) {
        aiResponse = "💪 Need manual help with lifting, shifting, or construction assistance? **Chhotu Lal (Labour / Helper)** is strong and reliable, available at ₹149/hr.";
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('rate')) {
        aiResponse = "💰 SevaSaathi is 100% transparent! You pay the expert directly based on their Hourly Rate × Booking Hours. No middleman cuts or commissions!";
      } else {
        aiResponse = `I am your SevaSaathi AI Mitra companion! You can book local handymen, cooks, cleaners, painters, masons, and labour helpers easily. Try searching for "Plumber for leaking pipe" or "Mistri for brickwork".`;
      }

      setChatMessages(prev => [...prev, { sender: 'assistant', text: aiResponse }]);
    } finally {
      setAiLoading(false);
    }
  };

  // BOOKING HANDLERS
  const handleInitiateBooking = (expert) => {
    setSelectedExpert(expert);
    setBookingInstructions('');
    setBookingDate(new Date().toISOString().split('T')[0]);
    const now = new Date();
    const currentHrs = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    setBookingTime(`${currentHrs}:${currentMins}`);
    setBookingDurationMinutes(0);
    setIsEmergencyBooking(false);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!bookingHouseNo.trim()) {
      setErrorMsg('Please specify your House/Flat number.');
      return;
    }
    if (!bookingStreet.trim()) {
      setErrorMsg('Please specify your Street, Sector, or Area.');
      return;
    }
    if (!bookingCity.trim()) {
      setErrorMsg('Please specify your City.');
      return;
    }
    if (!bookingPincode.trim()) {
      setErrorMsg('Please specify your Pincode.');
      return;
    }
    if (Number(bookingHours) === 0 && Number(bookingDurationMinutes) === 0) {
      setErrorMsg('Please select a valid duration (at least 15 minutes).');
      return;
    }

    const compiledAddress = [
      `House/Flat: ${bookingHouseNo.trim()}`,
      bookingApartment.trim() ? `Apartment: ${bookingApartment.trim()}` : '',
      `Street/Area: ${bookingStreet.trim()}`,
      `City: ${bookingCity.trim()}`,
      `State: ${bookingState.trim()}`,
      `Country: ${bookingCountry.trim()}`,
      `Pincode: ${bookingPincode.trim()}`
    ].filter(Boolean).join(', ');

    // Emergency option adds a flat ₹150 priority/express dispatch charge
    const fractionalHours = Number(bookingHours) + (Number(bookingDurationMinutes) / 60);
    const baseCost = selectedExpert.providerDetails.rate * fractionalHours;
    const totalCost = Math.round(baseCost + (isEmergencyBooking ? 150 : 0));
    
    const newBooking = {
      id: `b_${Date.now()}`,
      customerName: user?.name || 'Aarav Mehta',
      customerPhone: user?.phone || '9876543210',
      expertId: selectedExpert.id,
      expertName: selectedExpert.name,
      category: selectedExpert.providerDetails.category,
      hours: Number(bookingHours),
      minutes: Number(bookingDurationMinutes),
      cost: totalCost,
      instructions: bookingInstructions || 'No custom instructions provided.',
      address: compiledAddress,
      status: 'Pending',
      date: bookingDate,
      time: bookingTime,
      isEmergency: isEmergencyBooking,
      isBroadcast: false
    };

    setBookings(prev => [newBooking, ...prev]);
    setSelectedExpert(null);
    setSuccessMsg(`Doorstep Booking for ${newBooking.expertName} scheduled for ${newBooking.date} at ${newBooking.time} successfully!`);
    setActiveTab('bookings');

    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleCreateBroadcastBooking = (e) => {
    e.preventDefault();
    if (!broadcastHouseNo.trim()) {
      setErrorMsg('Please specify your House/Flat number for broadcast.');
      return;
    }
    if (!broadcastStreet.trim()) {
      setErrorMsg('Please specify your Street, Sector, or Area for broadcast.');
      return;
    }
    if (!broadcastCity.trim()) {
      setErrorMsg('Please specify your City for broadcast.');
      return;
    }
    if (!broadcastPincode.trim()) {
      setErrorMsg('Please specify your Pincode for broadcast.');
      return;
    }
    if (Number(broadcastHours) === 0 && Number(broadcastDurationMinutes) === 0) {
      setErrorMsg('Please select a valid duration (at least 15 minutes).');
      return;
    }

    const compiledBroadcastAddress = [
      `House/Flat: ${broadcastHouseNo.trim()}`,
      broadcastApartment.trim() ? `Apartment: ${broadcastApartment.trim()}` : '',
      `Street/Area: ${broadcastStreet.trim()}`,
      `City: ${broadcastCity.trim()}`,
      `State: ${broadcastState.trim()}`,
      `Country: ${broadcastCountry.trim()}`,
      `Pincode: ${broadcastPincode.trim()}`
    ].filter(Boolean).join(', ');

    const baseRate = 249; // Flat rate per hour for open category match booking
    const fractionalHours = Number(broadcastHours) + (Number(broadcastDurationMinutes) / 60);
    const baseCost = baseRate * fractionalHours;
    const totalCost = Math.round(baseCost + (broadcastIsEmergency ? 150 : 0));

    const newBooking = {
      id: `b_bc_${Date.now()}`,
      customerName: user?.name || 'Aarav Mehta',
      customerPhone: user?.phone || '9876543210',
      expertId: 'broadcast',
      expertName: 'Awaiting Fast Accept ⚡',
      category: broadcastCategory,
      hours: Number(broadcastHours),
      minutes: Number(broadcastDurationMinutes),
      cost: totalCost,
      instructions: broadcastInstructions || 'Open Broadcast Request: Urgent repair help needed.',
      address: compiledBroadcastAddress,
      status: 'Pending',
      date: broadcastDate,
      time: broadcastTime,
      isEmergency: broadcastIsEmergency,
      isBroadcast: true
    };

    setBookings(prev => [newBooking, ...prev]);
    setShowBroadcastForm(false);
    setSuccessMsg(`Your ${broadcastIsEmergency ? 'EMERGENCY' : 'scheduled'} request has been broadcasted! Nearby ${broadcastCategory}s will accept and contact you instantly.`);
    setActiveTab('bookings');

    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleAcceptBroadcast = (bookingId) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { 
          ...b, 
          expertId: user.id, 
          expertName: user.name, 
          isBroadcast: false, 
          status: 'In Progress' 
        };
      }
      return b;
    }));

    setSuccessMsg(`Request accepted! Head to the doorstep location immediately.`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const handleUpdateBookingStatus = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: newStatus };
      }
      return b;
    }));

    setSuccessMsg(`Booking status updated to: ${newStatus}`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ADMIN STATE
  const [users, setUsers] = useState([
    { id: 'user_1', name: 'Aarav Mehta', email: 'customer@sevasaathi.com', role: 'customer', isSuspended: false },
    { id: 'prov_1', name: 'Ramesh Kumar', email: 'provider@sevasaathi.com', role: 'provider', isSuspended: false, category: 'Electrician' },
    { id: 'prov_2', name: 'Sunita Sharma', email: 'provider@sevasaathi.com', role: 'provider', isSuspended: false, category: 'Cook / Chef' },
    { id: 'prov_3', name: 'Vikram Singh', email: 'provider@sevasaathi.com', role: 'provider', isSuspended: false, category: 'Plumber' }
  ]);
  const [expandedUserId, setExpandedUserId] = useState(null);

  const handleToggleSuspension = async (userId) => {
    try {
      const res = await api.put(`/user/admin/suspend/${userId}`);
      if (res.success) {
        setUsers(prev => prev.map(u => {
          if (u.id === userId || u._id === userId) {
            return { ...u, isSuspended: !u.isSuspended };
          }
          return u;
        }));
        setSuccessMsg(res.message || 'Account status modified successfully.');
      } else {
        setErrorMsg(res.message || 'Action failed');
      }
    } catch (err) {
      // Fallback
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, isSuspended: !u.isSuspended };
        }
        return u;
      }));
      setSuccessMsg('Account status modified successfully.');
    }
    setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
    }, 2000);
  };

  const handleApproveProvider = async (userId) => {
    try {
      const res = await api.put(`/user/admin/verify/${userId}`);
      if (res.success) {
        setExperts(prev => prev.map(exp => {
          if (exp.id === userId || exp._id === userId) {
            return { ...exp, providerDetails: { ...exp.providerDetails, isVerified: true } };
          }
          return exp;
        }));
        setUsers(prev => prev.map(u => {
          if (u.id === userId || u._id === userId) {
            return { ...u, providerDetails: { ...u.providerDetails, isVerified: true } };
          }
          return u;
        }));
        setSuccessMsg('Provider profile verified successfully!');
      } else {
        setErrorMsg(res.message || 'Verification failed');
      }
    } catch (err) {
      // Fallback
      setExperts(prev => prev.map(exp => {
        if (exp.id === userId) {
          return { ...exp, providerDetails: { ...exp.providerDetails, isVerified: true } };
        }
        return exp;
      }));
      setSuccessMsg('Provider profile verified successfully!');
    }
    setTimeout(() => {
      setSuccessMsg(null);
      setErrorMsg(null);
    }, 2000);
  };

  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profileImage', file);

    setUploadingDp(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.post('/user/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.success) {
        setSuccessMsg('Profile picture updated successfully!');
        await refreshUser();
      } else {
        setErrorMsg(res.message || 'Image upload failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploadingDp(false);
      setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 3000);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      name: profileForm.name,
      phone: profileForm.phone,
      address: profileForm.address
    };

    if (user.role === 'provider') {
      payload.providerDetails = {
        category: profileForm.category,
        rate: Number(profileForm.rate),
        bio: profileForm.bio,
        skills: profileForm.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
      };
    }

    try {
      const res = await api.put('/user/profile', payload);
      if (res.success) {
        setSuccessMsg('Profile details updated successfully!');
        await refreshUser();
      } else {
        setErrorMsg(res.message || 'Profile update failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
      setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 3000);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg('New passwords do not match!');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setChangingPassword(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.put('/user/changepassword', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (res.success) {
        setSuccessMsg('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setErrorMsg(res.message || 'Failed to change password.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to change password.');
    } finally {
      setChangingPassword(false);
      setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 3000);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressHouseNo.trim()) {
      setErrorMsg('Please specify your House/Flat number.');
      return;
    }
    if (!addressStreet.trim()) {
      setErrorMsg('Please specify your Street, Sector, or Area.');
      return;
    }
    if (!addressCity.trim()) {
      setErrorMsg('Please specify your City.');
      return;
    }
    if (!addressZip.trim()) {
      setErrorMsg('Please specify your ZIP / Postal code.');
      return;
    }

    const compiledAddress = [
      `House/Flat: ${addressHouseNo.trim()}`,
      addressApartment.trim() ? `Apartment: ${addressApartment.trim()}` : '',
      `Street/Area: ${addressStreet.trim()}`,
      `City: ${addressCity.trim()}`,
      `State: ${addressState.trim()}`,
      `Country: ${addressCountry.trim()}`,
      `Pincode: ${addressZip.trim()}`
    ].filter(Boolean).join(', ');

    try {
      const payload = {
        street: compiledAddress,
        city: addressCity,
        state: addressState,
        zipCode: addressZip,
        isDefault: true
      };
      await api.post('/user/addresses', payload);
      setSuccessMsg('New saved delivery address stored successfully!');
      setBookingAddress(compiledAddress);
      setAddressHouseNo('');
      setAddressApartment('');
      setAddressStreet('');
      setAddressCity('');
      setAddressState('Uttar Pradesh');
      setAddressCountry('India');
      setAddressZip('');
      refreshUser();
    } catch (err) {
      setBookingAddress(compiledAddress);
      setSuccessMsg('Doorstep address set successfully for the active session!');
      setAddressHouseNo('');
      setAddressApartment('');
      setAddressStreet('');
      setAddressCity('');
      setAddressState('Uttar Pradesh');
      setAddressCountry('India');
      setAddressZip('');
    }
  };

  // Sorting state variables for the sequencial lists
  const [customerSortBy, setCustomerSortBy] = useState('sequence');
  const [guestSortBy, setGuestSortBy] = useState('sequence');

  // Sorting helper to sequence experts logically
  const getSortedExperts = (expertsList, sortingCriteria) => {
    return [...expertsList].sort((a, b) => {
      if (sortingCriteria === 'sequence') {
        // 1. Available first, busy second
        const availA = a.providerDetails.availability === 'available' ? 0 : 1;
        const availB = b.providerDetails.availability === 'available' ? 0 : 1;
        if (availA !== availB) return availA - availB;

        // 2. Verified first, unverified second
        const verA = a.providerDetails.isVerified ? 0 : 1;
        const verB = b.providerDetails.isVerified ? 0 : 1;
        if (verA !== verB) return verA - verB;

        // 3. Highest rating first
        const ratingDiff = b.providerDetails.rating - a.providerDetails.rating;
        if (Math.abs(ratingDiff) > 0.01) return ratingDiff;

        // 4. Most completed jobs first
        return b.providerDetails.completedJobs - a.providerDetails.completedJobs;
      }

      if (sortingCriteria === 'rating') {
        return b.providerDetails.rating - a.providerDetails.rating;
      }

      if (sortingCriteria === 'rateAsc') {
        return a.providerDetails.rate - b.providerDetails.rate;
      }

      if (sortingCriteria === 'rateDesc') {
        return b.providerDetails.rate - a.providerDetails.rate;
      }

      if (sortingCriteria === 'experience') {
        return b.providerDetails.completedJobs - a.providerDetails.completedJobs;
      }

      return 0;
    });
  };

  // Filtered experts
  const baseFilteredExperts = experts.filter(exp => {
    const matchesCategory = exp.providerDetails.category === selectedCategory;
    const matchesQuery = exp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          exp.providerDetails.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const filteredExperts = getSortedExperts(baseFilteredExperts, customerSortBy);

  // GUEST LANDING PAGE PREVIEW CATEGORY TRIGGER
  const [guestCategory, setGuestCategory] = useState('Electrician');
  const baseGuestFilteredExperts = experts.filter(exp => exp.providerDetails.category === guestCategory);
  const guestFilteredExperts = getSortedExperts(baseGuestFilteredExperts, guestSortBy);

  // -------------------------------------------------------------
  // RENDERING MODE 1: PUBLIC VISITOR LANDING FRONT PAGE
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
        
        {/* Spectacular Hero Banner */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-900 overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.08),rgba(255,255,255,0))]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
            {/* Tagline Badge */}
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-mono">Commission-Free Local Services</span>
            </div>

            {/* Noble Title */}
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none">
              Har Ghar Ki Zaroorat Ka Ek Hi Saathi — <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">Aapka Apna SevaSaathi!</span>
            </h1>

            {/* Clear Description */}
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Book local certified handymen, cooks, maids, professional painters, masonry experts (mistri), and general labour helpers instantly. Pay them directly with zero middleman commissions.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-8 py-4 rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 hover:-translate-y-0.5 transition duration-150 flex items-center justify-center space-x-2"
              >
                <span>Find an Expert / Hire Now</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 text-white font-bold text-sm px-8 py-4 rounded-xl border border-slate-800 transition duration-150 flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4.5 h-4.5 text-amber-500" />
                <span>Join as Service Provider</span>
              </Link>
            </div>

            {/* Trust and Stats Panel */}
            <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left border-t border-slate-900">
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900">
                <span className="block text-2xl font-black text-amber-400 font-mono">100%</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Verified Partners</span>
              </div>
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900">
                <span className="block text-2xl font-black text-amber-400 font-mono">₹0</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Agent Commissions</span>
              </div>
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900">
                <span className="block text-2xl font-black text-white font-mono">2,500+</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Daily Bookings</span>
              </div>
              <div className="p-4 bg-slate-900/40 rounded-2xl border border-slate-900">
                <span className="block text-2xl font-black text-emerald-400 font-mono">4.8★</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Satisfaction Rate</span>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Category Preview & Explore Sector */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">Our Dedicated Service Categories</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">Explore transparent pricing and pre-screened specialists active in your sector.</p>
          </div>

          {/* Categories grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SERVICE_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => {
                  setGuestCategory(cat.name);
                  // Default back to smart sequence on category switch
                  setGuestSortBy('sequence');
                }}
                className={`p-5 rounded-2xl border text-left transition duration-300 cursor-pointer transform hover:scale-[1.03] active:scale-95 hover:shadow-lg ${
                  guestCategory === cat.name
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-amber-500/5'
                    : 'bg-slate-900/40 border-slate-900 text-slate-400 hover:border-slate-800'
                }`}
              >
                <span className="text-3xl mb-2.5 block">{cat.icon}</span>
                <h4 className="text-xs font-bold text-white">{cat.name}</h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{cat.desc}</p>
              </button>
            ))}
          </div>

          {/* Live Partner Preview based on chosen Category */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-850">
              <div>
                <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest">Active Experts Preview</span>
                <h3 className="font-display font-bold text-lg text-white mt-1">Verified {guestCategory}s Nearby</h3>
              </div>
              <Link
                to="/register"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
              >
                <span>View All Experts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Sequence & Sorting Controller Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/50 p-3 rounded-xl border border-slate-850/80">
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> SEQUENCE ORDER:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'sequence', label: '⚡ Smart Sequence' },
                  { id: 'rating', label: '⭐ Top Rated' },
                  { id: 'rateAsc', label: '₹ Low to High' },
                  { id: 'rateDesc', label: '₹ High to Low' },
                  { id: 'experience', label: '💼 Experience' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGuestSortBy(opt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition duration-150 cursor-pointer ${
                      guestSortBy === opt.id
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-white border border-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {guestFilteredExperts.map(exp => (
                <div key={exp.id} className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl flex items-start space-x-4">
                  <div className="relative shrink-0">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(exp.name)}&backgroundColor=f59e0b&textColor=0f172a`}
                      alt={exp.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-black text-white truncate">{exp.name}</h4>
                      {exp.providerDetails.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{exp.providerDetails.bio}</p>
                    <div className="flex items-center space-x-3 mt-2 text-[10px] text-slate-500 font-mono">
                      <span className="text-amber-400 font-bold">₹{exp.providerDetails.rate}/hr</span>
                      <span>•</span>
                      <span className="flex items-center text-amber-400"><Star className="w-3 h-3 fill-amber-400 mr-0.5" />{exp.providerDetails.rating}</span>
                      <span>•</span>
                      <span>{exp.providerDetails.completedJobs} Jobs</span>
                    </div>
                  </div>
                </div>
              ))}
              {guestFilteredExperts.length === 0 && (
                <div className="col-span-2 text-center py-6 text-xs text-slate-600">
                  No sample experts registered for this preview category yet. Join us to be the first!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Why SevaSaathi Marketplace Guarantee */}
        <section className="py-20 bg-slate-950 border-t border-slate-900/80 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 p-6 bg-slate-900/20 rounded-2xl border border-slate-900/60">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            <h4 className="text-sm font-bold text-white">Full Identity Verification</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every single handymen, cook, painter, or helper undergoes strict government ID checkups and manual skill endorsement before going live.
            </p>
          </div>

          <div className="space-y-3 p-6 bg-slate-900/20 rounded-2xl border border-slate-900/60">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-500" />
            </div>
            <h4 className="text-sm font-bold text-white">Zero Marketplace Cuts</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unlike commercial companies, we charge 0% commission fees. What you pay goes 100% directly to the expert providing the service.
            </p>
          </div>

          <div className="space-y-3 p-6 bg-slate-900/20 rounded-2xl border border-slate-900/60">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5 text-amber-500" />
            </div>
            <h4 className="text-sm font-bold text-white">24/7 AI Mitra Support</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our state-of-the-art AI Support Assistant works around the clock to help troubleshoot household bugs and suggest appropriate local bookings.
            </p>
          </div>
        </section>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDERING MODE 2: SECURED LOGGED-IN CONSOLE DASHBOARD (WITH SIDEBAR)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row relative">
      
      {/* Dynamic Left Sidebar containing custom Logo & state triggers */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Dashboard Primary Workspace Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 md:p-8 space-y-6">
          
          {/* Notification Alert Banner */}
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center space-x-3 text-emerald-400 animate-fade-in shrink-0">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-xs font-semibold">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center space-x-3 text-rose-400 animate-fade-in shrink-0">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-xs font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* -------------------------------------------------------------
              A. CUSTOMER ROLE VIEWS
              ------------------------------------------------------------- */}
          {user.role === 'customer' && (
            <div className="space-y-6">

              {/* Browse Tab: Find Local Service Experts */}
              {activeTab === 'browse' && (
                <div className="space-y-6">
                  
                  {/* Premium Dashboard Welcome Hero Banner */}
                  <div className="relative bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/25 rounded-2xl p-6 border border-slate-800/80 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase font-mono">India's Smart Service Hub</span>
                        </div>
                        <h2 className="font-display font-extrabold text-2xl text-white leading-tight">
                          Welcome back, <span className="text-amber-400">{user.name}</span>!
                        </h2>
                        <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                          Instantly book verified handymen, cooks, maids, painters, masons, and helper labourers. Check availability and ratings in real-time.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 shrink-0">
                        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 text-center">
                          <span className="block text-lg font-black text-amber-400 font-mono">1,200+</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Experts</span>
                        </div>
                        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 text-center">
                          <span className="block text-lg font-black text-emerald-400 font-mono">4.8★</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Avg Rating</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Search and Category Sector */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="font-display font-bold text-base text-white">Select Service Category</h3>
                      
                      {/* Search Bar Input */}
                      <div className="relative w-full sm:w-72">
                        <input
                          type="text"
                          placeholder="Search skills e.g. leak, wiring..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 focus:outline-none placeholder-slate-500"
                        />
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    {/* Category Selection Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {SERVICE_CATEGORIES.map(cat => (
                        <button
                          key={cat.name}
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setSelectedExpert(null);
                            // Default back to smart sequence on category change
                            setCustomerSortBy('sequence');
                          }}
                          className={`p-4 rounded-xl text-left border transition duration-300 cursor-pointer transform hover:scale-[1.03] active:scale-95 hover:shadow-lg ${
                            selectedCategory === cat.name
                              ? 'bg-amber-500/10 border-amber-500 text-white shadow-amber-500/5'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-2xl mb-1 block">{cat.icon}</span>
                          <p className="text-xs font-bold">{cat.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cat.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experts List / Active Selection Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Active list of Experts matching category (8 cols) */}
                    <div className="lg:col-span-8 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                          Available {selectedCategory} Specialists ({filteredExperts.length})
                        </h4>
                      </div>

                      {/* Customer Sequence & Sorting Controller Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-850/60 shadow-lg">
                        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> SEQUENCE ORDER:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {[
                            { id: 'sequence', label: '⚡ Smart Sequence' },
                            { id: 'rating', label: '⭐ Top Rated' },
                            { id: 'rateAsc', label: '₹ Low to High' },
                            { id: 'rateDesc', label: '₹ High to Low' },
                            { id: 'experience', label: '💼 Experience' }
                          ].map(opt => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setCustomerSortBy(opt.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition duration-150 cursor-pointer ${
                                customerSortBy === opt.id
                                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                                  : 'bg-slate-950 text-slate-400 hover:bg-slate-900 hover:text-white border border-slate-800'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {filteredExperts.map(exp => (
                          <div 
                            key={exp.id} 
                            className={`p-5 rounded-2xl border transition duration-150 flex flex-col sm:flex-row justify-between gap-4 ${
                              selectedExpert?.id === exp.id
                                ? 'bg-amber-500/5 border-amber-500 shadow-md shadow-amber-500/5'
                                : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start space-x-4">
                              <div className="relative shrink-0">
                                <img
                                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(exp.name)}&backgroundColor=f59e0b&textColor=0f172a`}
                                  alt={exp.name}
                                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-800/80"
                                />
                                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                                  exp.providerDetails.availability === 'available' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`} />
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex items-center space-x-2 flex-wrap">
                                  <h5 className="text-sm font-black text-white">{exp.name}</h5>
                                  {exp.providerDetails.isVerified && (
                                    <span className="inline-flex items-center text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                      <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified Saathi
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-500 font-mono">{exp.address}</span>
                                </div>

                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{exp.providerDetails.bio}</p>
                                
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {exp.providerDetails.skills.map((skill, idx) => (
                                    <span key={idx} className="text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded-md">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Action columns / Pricing */}
                            <div className="flex sm:flex-col justify-between items-end shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-850">
                              <div className="text-left sm:text-right">
                                <span className="block text-lg font-black text-amber-400 font-mono">₹{exp.providerDetails.rate}/hr</span>
                                <span className="text-[10px] text-slate-500 flex items-center sm:justify-end">
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                                  <strong>{exp.providerDetails.rating}</strong>&nbsp;({exp.providerDetails.ratingsCount} reviews)
                                </span>
                              </div>

                              <button
                                onClick={() => handleInitiateBooking(exp)}
                                disabled={exp.providerDetails.availability !== 'available'}
                                className={`text-xs font-bold py-2 px-4 rounded-xl cursor-pointer mt-3 transition duration-150 ${
                                  exp.providerDetails.availability === 'available'
                                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10'
                                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                }`}
                              >
                                {exp.providerDetails.availability === 'available' ? 'Book Instantly' : 'Busy / Engaged'}
                              </button>
                            </div>
                          </div>
                        ))}

                        {filteredExperts.length === 0 && (
                          <div className="p-8 text-center bg-slate-900/20 border border-slate-900 rounded-2xl space-y-2">
                            <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto" />
                            <h5 className="text-xs font-bold text-slate-400">No matching specialists found</h5>
                            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Try clearing your search queries or selecting other active categories like Cook, Painter, or Mason.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Form Sidebar widget (4 cols) */}
                    <div className="lg:col-span-4">
                      {selectedExpert ? (
                        <form onSubmit={handleConfirmBooking} className="bg-slate-900/60 border border-amber-500/20 rounded-2xl p-5 space-y-4 sticky top-20 animate-fade-in">
                          <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
                            <div>
                              <span className="text-[10px] text-amber-500 font-mono uppercase tracking-widest font-bold">New Booking</span>
                              <h4 className="font-display font-extrabold text-sm text-white mt-1">Hire {selectedExpert.name}</h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedExpert(null)}
                              className="text-xs text-slate-500 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] text-slate-500 uppercase font-mono block">Category Service</span>
                            <span className="text-xs text-white font-bold">{selectedExpert.providerDetails.category} Specialist</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Expert Rate</label>
                              <span className="text-sm font-bold text-white font-mono">₹{selectedExpert.providerDetails.rate}/hr</span>
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Duration Needed</label>
                              <div className="flex items-center space-x-1">
                                <select
                                  value={bookingHours}
                                  onChange={(e) => setBookingHours(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-1.5 text-xs font-bold font-mono text-white text-center focus:outline-none focus:border-amber-500"
                                >
                                  {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
                                    <option key={h} value={h}>{h} h</option>
                                  ))}
                                </select>
                                <select
                                  value={bookingDurationMinutes}
                                  onChange={(e) => setBookingDurationMinutes(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-1.5 text-xs font-bold font-mono text-white text-center focus:outline-none focus:border-amber-500"
                                >
                                  {[0, 15, 30, 45].map(m => (
                                    <option key={m} value={m}>{m} m</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-500 uppercase font-mono">Preferred Date</label>
                              <input
                                type="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={bookingDate}
                                onChange={(e) => setBookingDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-500 uppercase font-mono">Preferred Time</label>
                              <input
                                type="time"
                                required
                                value={bookingTime}
                                onChange={(e) => setBookingTime(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                            <div>
                              <p className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-rose-400" /> Blinkit Style Express Match
                              </p>
                              <p className="text-[9px] text-slate-500">SevaSaathi Express and fast service. Arriving at your Noida doorstep in 10-30 min (+ ₹150 priority fee).</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={isEmergencyBooking}
                              onChange={(e) => {
                                setIsEmergencyBooking(e.target.checked);
                                if (e.target.checked) {
                                  const dStr = new Date().toISOString().split('T')[0];
                                  setBookingDate(dStr);
                                  const now = new Date();
                                  setBookingTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
                                }
                              }}
                              className="accent-rose-500 h-4.5 w-4.5 rounded cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-500 uppercase font-mono">Task Instructions</label>
                            <textarea
                              placeholder="e.g. Bring extra ladder, water leak under kitchen sink basin, tile breakage repair..."
                              value={bookingInstructions}
                              onChange={(e) => setBookingInstructions(e.target.value)}
                              rows="3"
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                            />
                          </div>

                          <div className="space-y-3 p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                            <span className="text-[10px] text-amber-500 uppercase font-mono font-bold block mb-1">📍 Delivery & Doorstep Address</span>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">House/Flat No *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Flat 102, Block C"
                                  required
                                  value={bookingHouseNo}
                                  onChange={(e) => setBookingHouseNo(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">Apartment/Society</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Sunrise Heights"
                                  value={bookingApartment}
                                  onChange={(e) => setBookingApartment(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">Street / Sector / Area *</label>
                              <input
                                type="text"
                                placeholder="e.g. Sector 62, Near Park"
                                required
                                value={bookingStreet}
                                onChange={(e) => setBookingStreet(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">City *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Noida"
                                  required
                                  value={bookingCity}
                                  onChange={(e) => setBookingCity(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">Pincode *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 201301"
                                  required
                                  value={bookingPincode}
                                  onChange={(e) => setBookingPincode(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">State *</label>
                                <select
                                  value={bookingState}
                                  onChange={(e) => setBookingState(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                >
                                  {['Uttar Pradesh', 'Delhi', 'Haryana', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan', 'Bihar', 'Punjab'].map(st => (
                                    <option key={st} value={st}>{st}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">Country *</label>
                                <select
                                  value={bookingCountry}
                                  onChange={(e) => setBookingCountry(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                >
                                  {['India', 'United States', 'United Arab Emirates', 'United Kingdom', 'Canada', 'Australia'].map(cntry => (
                                    <option key={cntry} value={cntry}>{cntry}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="h-px bg-slate-800" />

                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-mono">Estimated Cost</span>
                              <p className="text-xl font-black text-amber-400 font-mono">
                                ₹{Math.round(selectedExpert.providerDetails.rate * (Number(bookingHours) + Number(bookingDurationMinutes) / 60) + (isEmergencyBooking ? 150 : 0))}
                              </p>
                            </div>
                            <button
                              type="submit"
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 px-6 rounded-xl shadow-lg shadow-amber-500/15 cursor-pointer transition duration-150"
                            >
                              Confirm Booking
                            </button>
                          </div>
                        </form>
                      ) : showBroadcastForm ? (
                        <form onSubmit={handleCreateBroadcastBooking} className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 space-y-4 sticky top-20 animate-fade-in">
                          <div className="border-b border-slate-800 pb-3 flex justify-between items-start">
                            <div>
                              <span className="text-[10px] text-amber-500 font-mono uppercase tracking-widest font-bold">Fast-Track Broadcast</span>
                              <h4 className="font-display font-extrabold text-sm text-white mt-1">Open Service Request</h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowBroadcastForm(false)}
                              className="text-xs text-slate-500 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-500 uppercase font-mono">Select Service Category</label>
                            <select
                              value={broadcastCategory}
                              onChange={(e) => setBroadcastCategory(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                            >
                              <option>Electrician</option>
                              <option>Plumber</option>
                              <option>Mechanic</option>
                              <option>Cook / Chef</option>
                              <option>Cleaner / Maid</option>
                              <option>Painter</option>
                              <option>Mistri (Mason)</option>
                              <option>Labour (Helper)</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Standard Rate</label>
                              <span className="text-sm font-bold text-slate-300 font-mono">₹249/hr</span>
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase font-mono mb-1">Duration Needed</label>
                              <div className="flex items-center space-x-1">
                                <select
                                  value={broadcastHours}
                                  onChange={(e) => setBroadcastHours(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-1.5 text-xs font-bold font-mono text-white text-center focus:outline-none"
                                >
                                  {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
                                    <option key={h} value={h}>{h} h</option>
                                  ))}
                                </select>
                                <select
                                  value={broadcastDurationMinutes}
                                  onChange={(e) => setBroadcastDurationMinutes(Number(e.target.value))}
                                  className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-1.5 text-xs font-bold font-mono text-white text-center focus:outline-none font-bold"
                                >
                                  {[0, 15, 30, 45].map(m => (
                                    <option key={m} value={m}>{m} m</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-500 uppercase font-mono">Preferred Date</label>
                              <input
                                type="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                                value={broadcastDate}
                                onChange={(e) => setBroadcastDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-500 uppercase font-mono">Preferred Time</label>
                              <input
                                type="time"
                                required
                                value={broadcastTime}
                                onChange={(e) => setBroadcastTime(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                            <div>
                              <p className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-rose-400" /> Blinkit Style Express Match
                              </p>
                              <p className="text-[9px] text-slate-500">SevaSaathi Express and fast service. Arriving at your Noida doorstep in 10-30 min (+ ₹150 priority fee).</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={broadcastIsEmergency}
                              onChange={(e) => {
                                setBroadcastIsEmergency(e.target.checked);
                                if (e.target.checked) {
                                  const dStr = new Date().toISOString().split('T')[0];
                                  setBroadcastDate(dStr);
                                  const now = new Date();
                                  setBroadcastTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
                                }
                              }}
                              className="accent-rose-500 h-4.5 w-4.5 rounded cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] text-slate-500 uppercase font-mono">Special Instructions</label>
                            <textarea
                              placeholder="Describe the issue so matching nearby providers know exactly what's needed..."
                              value={broadcastInstructions}
                              onChange={(e) => setBroadcastInstructions(e.target.value)}
                              rows="2"
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
                            />
                          </div>

                          <div className="space-y-3 p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
                            <span className="text-[10px] text-amber-500 uppercase font-mono font-bold block mb-1">📍 Dispatch Location</span>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">House/Flat No *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Flat 102, Block C"
                                  required
                                  value={broadcastHouseNo}
                                  onChange={(e) => setBroadcastHouseNo(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">Apartment/Society</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Sunrise Heights"
                                  value={broadcastApartment}
                                  onChange={(e) => setBroadcastApartment(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">Street / Sector / Area *</label>
                              <input
                                type="text"
                                placeholder="e.g. Sector 62, Near Park"
                                required
                                value={broadcastStreet}
                                onChange={(e) => setBroadcastStreet(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">City *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Noida"
                                  required
                                  value={broadcastCity}
                                  onChange={(e) => setBroadcastCity(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">Pincode *</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 201301"
                                  required
                                  value={broadcastPincode}
                                  onChange={(e) => setBroadcastPincode(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">State *</label>
                                <select
                                  value={broadcastState}
                                  onChange={(e) => setBroadcastState(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                >
                                  {['Uttar Pradesh', 'Delhi', 'Haryana', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan', 'Bihar', 'Punjab'].map(st => (
                                    <option key={st} value={st}>{st}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-500 uppercase font-mono mb-1">Country *</label>
                                <select
                                  value={broadcastCountry}
                                  onChange={(e) => setBroadcastCountry(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                                >
                                  {['India', 'United States', 'United Arab Emirates', 'United Kingdom', 'Canada', 'Australia'].map(cntry => (
                                    <option key={cntry} value={cntry}>{cntry}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="h-px bg-slate-800" />

                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-mono">Total Estimated</span>
                              <p className="text-xl font-black text-amber-400 font-mono">
                                ₹{Math.round(249 * (Number(broadcastHours) + Number(broadcastDurationMinutes) / 60) + (broadcastIsEmergency ? 150 : 0))}
                              </p>
                            </div>
                            <button
                              type="submit"
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 px-6 rounded-xl shadow-lg shadow-amber-500/15 cursor-pointer transition duration-150"
                            >
                              Broadcast Call ⚡
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-4 sticky top-20">
                          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 text-center space-y-3">
                            <Users className="w-8 h-8 text-slate-700 mx-auto" />
                            <h5 className="text-xs font-bold text-slate-400">Instant Doorstep Dispatch</h5>
                            <p className="text-[11px] text-slate-500 leading-relaxed">Select any active specialist on the left to customize work hours, view overall estimates, and submit immediate local service dispatches.</p>
                          </div>

                          <div className="bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/20 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center space-x-2">
                              <Zap className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                              <h5 className="text-xs font-bold text-amber-400">Need Super Fast Help?</h5>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              Can't find a matching specialist or need immediate urgent assistance? Create an open category-level request broadcasted to all nearby providers!
                            </p>
                            <button
                              onClick={() => {
                                setBroadcastCategory(selectedCategory);
                                setBroadcastAddress(bookingAddress || user?.address || '');
                                setShowBroadcastForm(true);
                              }}
                              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl cursor-pointer transition flex items-center justify-center space-x-1.5"
                            >
                              <span>🚨 Create Open Broadcast Call</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings Tab: Manage active & historical bookings */}
              {activeTab === 'bookings' && (
                <div className="space-y-6 max-w-4xl animate-fade-in">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-white">Your SevaSaathi Bookings</h3>
                      <p className="text-xs text-slate-400">Track current doorstep assignments, service costs, and active status.</p>
                    </div>
                    <span className="text-xs font-mono bg-slate-900 border border-slate-850 px-3 py-1.5 rounded-xl text-slate-400">
                      Total: {bookings.length} jobs
                    </span>
                  </div>

                  {/* LIVE BLINKIT GPS RADAR TRACKER COMPONENT */}
                  {trackedBookingId && (() => {
                    const trackedB = bookings.find(b => b.id === trackedBookingId);
                    if (!trackedB) return null;
                    return (
                      <div className="bg-slate-950 border-2 border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-[0_0_20px_rgba(245,158,11,0.05)] animate-fade-in">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <span className="flex h-2.5 w-2.5 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <div>
                              <h4 className="text-sm font-black text-white flex items-center gap-1.5 font-display">
                                <span>GPS Live Tracking SevaSaathi Provider</span>
                                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 py-0.5 px-2 rounded font-mono uppercase">
                                  Blinkit-Style Delivery
                                </span>
                              </h4>
                              <p className="text-xs text-slate-500">Tracking assigned expert: <strong className="text-slate-300 font-bold">{trackedB.expertName}</strong> ({trackedB.category})</p>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => setTrackedBookingId(null)}
                            className="text-xs font-bold text-slate-500 hover:text-white px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                          >
                            Close Radar ×
                          </button>
                        </div>

                        {/* Interactive Steps Meter */}
                        <div className="grid grid-cols-5 gap-2 text-center pt-2">
                          {[
                            { step: 1, label: 'Confirmed', sub: 'Preparing tools' },
                            { step: 2, label: 'Dispatched 🚴', sub: 'On vehicle' },
                            { step: 3, label: 'On Route', sub: 'Speeding over' },
                            { step: 4, label: 'Nearby (200m)', sub: 'Arriving now' },
                            { step: 5, label: 'At Doorstep 📍', sub: 'Calling doorbell' }
                          ].map(s => {
                            const isPast = trackingStep >= s.step;
                            const isCurrent = trackingStep === s.step;
                            return (
                              <div key={s.step} className="space-y-1.5">
                                <div className={`h-1.5 rounded-full transition-all duration-500 ${
                                  isPast ? 'bg-emerald-500' : 'bg-slate-800'
                                } ${isCurrent ? 'animate-pulse' : ''}`} />
                                <p className={`text-[10px] font-bold ${isPast ? 'text-slate-200' : 'text-slate-500'}`}>
                                  {s.label}
                                </p>
                                <p className="text-[8px] text-slate-600 hidden sm:block">
                                  {s.sub}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Visual Animated Navigation Path / Radar map */}
                        <div className="relative h-44 bg-slate-900/80 border border-slate-800/85 rounded-xl overflow-hidden flex items-center justify-center p-4">
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />
                          
                          <div className="absolute w-44 h-44 rounded-full border border-slate-850/30 animate-pulse" />
                          <div className="absolute w-28 h-28 rounded-full border border-slate-850/20" />
                          <div className="absolute w-12 h-12 rounded-full border border-slate-800/30" />

                          <div className="absolute w-4/5 h-0.5 bg-dashed border-t border-dashed border-slate-700/60 top-1/2 left-10 -translate-y-1/2 z-0" />
                          
                          <div 
                            className="absolute h-0.5 bg-gradient-to-r from-amber-500 to-emerald-400 top-1/2 left-10 -translate-y-1/2 z-0 transition-all duration-1000"
                            style={{ width: `${Math.min(80, Math.max(0, 80 - (trackingDistance / 2400) * 80))}%` }}
                          />

                          {/* Destination */}
                          <div className="absolute right-10 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                            <div className="bg-emerald-500 p-1.5 rounded-full shadow-lg shadow-emerald-500/20 text-slate-950">
                              <MapPin className="w-3.5 h-3.5 fill-slate-950" />
                            </div>
                            <span className="text-[9px] font-mono font-bold text-emerald-400 mt-1 bg-slate-950/90 py-0.5 px-1.5 border border-emerald-500/20 rounded">
                              Your Doorstep
                            </span>
                          </div>

                          {/* Moving provider */}
                          {trackingStep < 5 ? (
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 z-10 flex flex-col items-center transition-all duration-1000"
                              style={{ left: `${Math.max(10, Math.min(75, 10 + (1 - trackingDistance / 2400) * 65))}%` }}
                            >
                              <div className="bg-amber-400 p-2 rounded-full shadow-lg shadow-amber-400/30 text-slate-950 animate-bounce">
                                <Zap className="w-4 h-4 fill-slate-950 animate-pulse" />
                              </div>
                              <span className="text-[9px] font-mono font-bold text-amber-400 mt-1 bg-slate-950/90 py-0.5 px-1.5 border border-amber-500/20 rounded flex items-center gap-1">
                                {trackedB.expertName}
                              </span>
                            </div>
                          ) : (
                            <div className="absolute right-24 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                              <span className="text-xs bg-emerald-500 text-slate-950 font-black py-1 px-3 rounded-full animate-bounce shadow-lg shadow-emerald-500/35 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Expert Arrived! 🛎️
                              </span>
                            </div>
                          )}

                          {/* HUD data */}
                          <div className="absolute bottom-3 left-3 bg-slate-950/95 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-4 font-mono z-20">
                            <div>
                              <p className="text-[8px] text-slate-500 uppercase tracking-wider leading-none">GPS Distance</p>
                              <p className="text-xs font-black text-white mt-1">
                                {trackingDistance > 0 ? `${trackingDistance} meters` : 'Reached Doorstep'}
                              </p>
                            </div>
                            <div className="h-6 w-px bg-slate-800" />
                            <div>
                              <p className="text-[8px] text-slate-500 uppercase tracking-wider leading-none">Blinkit Delivery ETA</p>
                              <p className="text-xs font-black text-amber-400 mt-1">
                                {trackingEta > 0 ? `${trackingEta} mins` : 'Arrived Now'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Alerts status */}
                        <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex justify-between items-center text-xs">
                          <p className="text-slate-400">
                            <strong>Status:</strong> {
                              trackingStep === 1 ? 'Specialist accepting your tools and matching doorstep routing coordinates...' :
                              trackingStep === 2 ? `Expert ${trackedB.expertName} has mounted their vehicle and is dispatched!` :
                              trackingStep === 3 ? 'Heading over via Noida sector road. Speeding down towards your society gate.' :
                              trackingStep === 4 ? 'Arrived at society main gate! Entering and finding your building block.' :
                              'Expert is at your doorstep. Please answer door!'
                            }
                          </p>
                          <span className="text-[10px] font-bold text-slate-500 font-mono shrink-0 ml-2">
                            📞 {trackedB.customerPhone || '9876543210'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-3.5">
                    {bookings.map(b => (
                      <div key={b.id} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-xs font-bold text-white">{b.expertName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">({b.category})</span>
                            <span className={`text-[9px] font-bold font-mono uppercase tracking-wider py-0.5 px-2 rounded-full ${
                              b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                              b.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' :
                              b.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {b.status}
                            </span>
                            {b.isEmergency && (
                              <span className="text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 py-0.5 px-2 rounded-full uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                                <Zap className="w-2.5 h-2.5 fill-rose-400" /> EMERGENCY (10-30 MIN ARRIVAL)
                              </span>
                            )}
                            {b.isBroadcast && (
                              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 py-0.5 px-2 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                                <Bot className="w-2.5 h-2.5" /> Broadcast
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 border border-slate-800 rounded-lg ml-auto sm:ml-0">
                              📅 {b.date} {b.time ? `@ ${b.time}` : ''}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300"><strong className="text-slate-500 font-normal">Instructions:</strong> {b.instructions}</p>
                          
                          <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-500">
                            <span className="flex items-center">
                              <Clock className="w-3.5 h-3.5 mr-1" />
                              {b.hours} hrs {b.minutes > 0 ? `${b.minutes} mins` : ''} Needed
                            </span>
                            <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{b.address}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col justify-between items-end w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-850 shrink-0">
                          <div className="text-left sm:text-right">
                            <span className="text-base font-black text-amber-400 font-mono">₹{b.cost}</span>
                            <p className="text-[9px] text-slate-500 uppercase tracking-wider leading-none">Total Paid</p>
                          </div>
                          
                          {/* Live Track Action trigger */}
                          {(b.status === 'In Progress' || b.status === 'Pending') && b.expertId !== 'broadcast' && (
                            <button
                              type="button"
                              onClick={() => setTrackedBookingId(b.id)}
                              className="mt-2.5 bg-amber-500 text-slate-950 hover:bg-amber-400 text-[10px] font-black py-1.5 px-3 rounded-xl cursor-pointer transition flex items-center gap-1 shadow-md shadow-amber-500/15"
                            >
                              <Zap className="w-3 h-3 fill-slate-950" /> Track Live Location 📍
                            </button>
                          )}

                          {b.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                              className="mt-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-rose-500/20 transition cursor-pointer"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {bookings.length === 0 && (
                      <div className="text-center p-8 bg-slate-900/20 border border-slate-900 rounded-2xl">
                        <p className="text-xs text-slate-500">You haven't made any doorstep booking requests yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Addresses Tab: Saved doorstep locations */}
              {activeTab === 'addresses' && (
                <div className="space-y-6 max-w-xl animate-fade-in">
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-white">Saved Delivery Addresses</h3>
                    <p className="text-xs text-slate-400">Add or manage primary location targets for immediate handyman dispatches.</p>
                  </div>

                  <form onSubmit={handleSaveAddress} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">House/Flat No *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Flat 102, Block C"
                            value={addressHouseNo}
                            onChange={e => setAddressHouseNo(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Apartment/Society</label>
                          <input
                            type="text"
                            placeholder="e.g. Sunrise Heights"
                            value={addressApartment}
                            onChange={e => setAddressApartment(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Street / Sector / Area *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Sector 62, Near Park"
                          value={addressStreet}
                          onChange={e => setAddressStreet(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">City *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Noida"
                            value={addressCity}
                            onChange={e => setAddressCity(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">ZIP / Postal Code *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 201301"
                            value={addressZip}
                            onChange={e => setAddressZip(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">State *</label>
                          <select
                            value={addressState}
                            onChange={e => setAddressState(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none"
                          >
                            {['Uttar Pradesh', 'Delhi', 'Haryana', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan', 'Bihar', 'Punjab'].map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Country *</label>
                          <select
                            value={addressCountry}
                            onChange={e => setAddressCountry(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 px-3 text-xs text-slate-200 focus:outline-none"
                          >
                            {['India', 'United States', 'United Arab Emirates', 'United Kingdom', 'Canada', 'Australia'].map(cntry => (
                              <option key={cntry} value={cntry}>{cntry}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 px-5 rounded-xl shadow-md shadow-amber-500/10 cursor-pointer"
                      >
                        Add Target Location
                      </button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Active Target Zone</h4>
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-white">{bookingAddress || 'No doorstep addresses saved.'}</p>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mt-0.5">PRIMARY SERVICE TARGET</span>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* AI Support Mitra Tab */}
              {activeTab === 'ai-mitra' && (
                <div className="max-w-3xl bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col h-[580px] animate-fade-in mx-auto">
                  <div className="pb-4 border-b border-slate-800/80 flex items-center space-x-3 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                    <div>
                      <h3 className="font-display font-extrabold text-sm text-white flex items-center">
                        <span>SevaSaathi AI Support</span>
                        <Bot className="w-5 h-5 text-amber-400 ml-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Instant plumbing diagnostics, chef menus, masonry help, and booking setup guides.</p>
                    </div>
                  </div>

                  {/* Chat Box Scroll */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none shadow-md shadow-amber-500/5'
                            : 'bg-slate-950 text-slate-300 rounded-tl-none border border-slate-850'
                        }`}>
                          {msg.sender === 'user' ? (
                            msg.text
                          ) : (
                            <PointWiseRenderer text={msg.text} />
                          )}
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-slate-950 border border-slate-850 p-3 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Smart quick suggestions inside chat window */}
                  <div className="flex flex-wrap gap-2 py-2 shrink-0 border-t border-slate-800/80 mb-2">
                    <button 
                      onClick={() => setChatInput("My kitchen mainboard is sparkling. Suggest an Electrician.")}
                      className="text-[10px] text-slate-400 hover:text-white bg-slate-950/60 border border-slate-850 px-2.5 py-1.5 rounded-lg"
                    >
                      ⚡ Sparking Electrician
                    </button>
                    <button 
                      onClick={() => setChatInput("Do you have a Mistri for tile fixing?")}
                      className="text-[10px] text-slate-400 hover:text-white bg-slate-950/60 border border-slate-850 px-2.5 py-1.5 rounded-lg"
                    >
                      🧱 Tile Mason / Mistri
                    </button>
                    <button 
                      onClick={() => setChatInput("Need heavy luggage shifted today.")}
                      className="text-[10px] text-slate-400 hover:text-white bg-slate-950/60 border border-slate-850 px-2.5 py-1.5 rounded-lg"
                    >
                      💪 Shift/Labour Helper
                    </button>
                  </div>

                  {/* Chat form Input */}
                  <form onSubmit={handleSendChatMessage} className="shrink-0 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Ask Mitra e.g. How to handle a leaking pipe or book a cook..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-850 focus:border-amber-500 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none placeholder-slate-650"
                    />
                    <button
                      type="submit"
                      className="p-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl cursor-pointer transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}

          {/* -------------------------------------------------------------
              B. SERVICE PROVIDER ROLE VIEWS
              ------------------------------------------------------------- */}
          {user.role === 'provider' && (
            <div className="space-y-6 animate-fade-in">

              {/* Jobs Tab: Bookings dispatches and controls */}
              {activeTab === 'jobs' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Bookings Feed (8 cols) */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Part 1: Assigned to Me */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                        <div>
                          <h3 className="font-display font-extrabold text-base text-white">My Doorstep Job Assignments</h3>
                          <p className="text-xs text-slate-500">Your accepted orders and scheduled customer dispatches.</p>
                        </div>
                        <span className="text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-slate-400 font-bold">
                          Total: {bookings.filter(b => b.expertId === user.id).length} Active
                        </span>
                      </div>

                      <div className="space-y-3.5">
                        {bookings.filter(b => b.expertId === user.id).map(b => (
                          <div key={b.id} className={`border rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition duration-150 ${
                            b.isEmergency 
                              ? 'bg-rose-950/20 border-rose-500/30' 
                              : 'bg-slate-900/60 border-slate-800/80'
                          }`}>
                            <div className="space-y-1.5">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="text-xs font-bold text-white">{b.customerName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">📞 {b.customerPhone}</span>
                                <span className={`text-[9px] font-bold font-mono uppercase tracking-wider py-0.5 px-2 rounded-full ${
                                  b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                  b.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' :
                                  b.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {b.status}
                                </span>
                                {b.isEmergency && (
                                  <span className="text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20 py-0.5 px-2 rounded-full uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                                    <Zap className="w-2.5 h-2.5 fill-rose-400" /> EMERGENCY
                                  </span>
                                )}
                                <span className="text-[10px] text-amber-400 font-mono bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded-lg">
                                  📅 Scheduled: {b.date}
                                </span>
                              </div>

                              <p className="text-xs text-slate-300"><strong className="text-slate-500 font-normal">Customer Task:</strong> {b.instructions}</p>
                              
                              <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-500">
                                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{b.hours} Hours</span>
                                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{b.address}</span>
                              </div>
                            </div>

                            <div className="flex sm:flex-col justify-between items-end w-full sm:w-auto border-t sm:border-t-0 border-slate-850 pt-3 sm:pt-0 shrink-0">
                              <div className="text-left sm:text-right mb-2">
                                <span className="text-base font-black text-amber-400 font-mono">₹{b.cost}</span>
                                <p className="text-[9px] text-slate-500 uppercase tracking-wider leading-none">Net Earning</p>
                              </div>

                              {b.status === 'Pending' && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                                    className="bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 text-[10px] font-bold py-1.5 px-3 rounded-lg border border-rose-500/20 transition cursor-pointer"
                                  >
                                    Decline
                                  </button>
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.id, 'In Progress')}
                                    className="bg-emerald-500/15 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 text-[10px] font-bold py-1.5 px-3 rounded-lg border border-emerald-500/20 transition cursor-pointer"
                                  >
                                    Accept Job
                                  </button>
                                </div>
                              )}

                              {b.status === 'In Progress' && (
                                <button
                                  onClick={() => handleUpdateBookingStatus(b.id, 'Completed')}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:text-slate-950 text-[10px] font-bold py-1.5 px-3 rounded-lg border border-emerald-500/20 transition cursor-pointer"
                                >
                                  Mark Completed
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {bookings.filter(b => b.expertId === user.id).length === 0 && (
                          <div className="text-center p-6 bg-slate-900/20 border border-slate-900 rounded-2xl">
                            <p className="text-xs text-slate-500">No active directly assigned doorstep jobs currently.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Part 2: Nearby Category Broadcasts */}
                    <div className="space-y-4 pt-4 border-t border-slate-900">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                        <div>
                          <h3 className="font-display font-extrabold text-base text-white flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-rose-400 fill-rose-400/20" />
                            <span>Nearby Open Broadcast Feed ({user.providerDetails?.category || 'General'})</span>
                          </h3>
                          <p className="text-xs text-slate-500">Instant-match requests broadcasted in your service sector.</p>
                        </div>
                        <span className="text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/15 py-1 px-2.5 rounded-full uppercase font-bold animate-pulse">
                          ● LIVE DISPATCH
                        </span>
                      </div>

                      <div className="space-y-3.5">
                        {bookings.filter(b => b.isBroadcast && b.category === (user.providerDetails?.category || 'Electrician') && b.status === 'Pending').map(b => (
                          <div key={b.id} className={`border rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition duration-150 animate-fade-in ${
                            b.isEmergency 
                              ? 'bg-rose-950/25 border-rose-500/40 shadow-[0_0_15px_rgba(239,68,68,0.05)]' 
                              : 'bg-slate-900/60 border-slate-800/80'
                          }`}>
                            <div className="space-y-1.5">
                              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                <span className="text-xs font-extrabold text-white">{b.customerName}</span>
                                <span className="text-[10px] text-slate-400 font-mono">📱 {b.customerPhone}</span>
                                {b.isEmergency && (
                                  <span className="text-[9px] font-extrabold bg-rose-500 text-white py-0.5 px-2 rounded-full uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                                    <Zap className="w-2.5 h-2.5 fill-white" /> URGENT EMERGENCY
                                  </span>
                                )}
                                <span className="text-[10px] text-amber-400 font-mono bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded-lg">
                                  📅 Date Needed: {b.date}
                                </span>
                              </div>

                              <p className="text-xs text-slate-300"><strong className="text-slate-500 font-normal">Task details:</strong> {b.instructions}</p>
                              
                              <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-500">
                                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{b.hours} Hours Requested</span>
                                <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{b.address}</span>
                              </div>
                            </div>

                            <div className="flex sm:flex-col justify-between items-end w-full sm:w-auto border-t sm:border-t-0 border-slate-850 pt-3 sm:pt-0 shrink-0">
                              <div className="text-left sm:text-right mb-3">
                                <span className="text-base font-black text-emerald-400 font-mono">₹{b.cost}</span>
                                <p className="text-[9px] text-slate-500 uppercase tracking-wider leading-none">Earning (100%)</p>
                              </div>

                              <button
                                onClick={() => handleAcceptBroadcast(b.id)}
                                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] py-2 px-4 rounded-xl shadow-lg shadow-amber-500/15 cursor-pointer transition flex items-center gap-1.5 justify-center"
                              >
                                <Zap className="w-3.5 h-3.5 fill-slate-950" /> Accept & Dispatch
                              </button>
                            </div>
                          </div>
                        ))}

                        {bookings.filter(b => b.isBroadcast && b.category === (user.providerDetails?.category || 'Electrician') && b.status === 'Pending').length === 0 && (
                          <div className="text-center p-8 bg-slate-900/10 border border-slate-900 rounded-2xl space-y-1">
                            <p className="text-xs text-slate-500 font-bold">No active broadcast requests matching your skill category.</p>
                            <p className="text-[10px] text-slate-600">As soon as customers post open dispatches in Noida, they will stream live here.</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Stats Sidebar / Portal (4 cols) */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
                      <div>
                        <h4 className="font-display font-bold text-sm text-white mb-1">Your Performance Panel</h4>
                        <p className="text-xs text-slate-500">Real-time stats based on completed community service tasks.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Completed</span>
                          <span className="block text-lg font-black text-white mt-1">{user.providerDetails?.completedJobs || 42} Jobs</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">My Rate</span>
                          <span className="block text-lg font-black text-amber-400 font-mono mt-1">₹{user.providerDetails?.rate || 250}/h</span>
                        </div>
                        <div className="col-span-2 p-3 bg-slate-950/60 rounded-xl border border-slate-850 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Total Net Earnings</span>
                            <span className="block text-lg font-black text-emerald-400 font-mono mt-0.5">₹{user.providerDetails?.earnings || 18500}</span>
                          </div>
                          <span className="text-[9px] font-mono py-0.5 px-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">0% Cut Taken</span>
                        </div>
                      </div>

                      <div className="h-px bg-slate-800" />

                      <div className="space-y-2">
                        <h5 className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Verification Status</h5>
                        {user.providerDetails?.isVerified ? (
                          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 flex items-center space-x-2 text-emerald-400">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-xs font-bold">Identity & Skills Verified</span>
                          </div>
                        ) : (
                          <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 flex items-center space-x-2 text-amber-400">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs font-bold">Verification In Progress</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Availability tab: Manage status offline/online */}
              {activeTab === 'availability' && (
                <div className="max-w-xl space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-white">My Availability Status</h3>
                    <p className="text-xs text-slate-400">Control when customers can discover and book you in your sector zone.</p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                    <div className="space-y-2">
                      <button
                        onClick={() => setProviderAvailability('available')}
                        className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition cursor-pointer ${
                          providerAvailability === 'available'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2.5 animate-pulse" />
                          <span>Active / Ready for Immediate Doorstep Dispatch</span>
                        </span>
                        <span className="text-[9px] font-mono leading-none py-1 px-2 rounded bg-emerald-500/20 uppercase font-bold">Available</span>
                      </button>

                      <button
                        onClick={() => setProviderAvailability('busy')}
                        className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition cursor-pointer ${
                          providerAvailability === 'busy'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500'
                            : 'bg-slate-950 border-slate-855 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-amber-500 mr-2.5" />
                          <span>Currently Engaged on Active Job Assignment</span>
                        </span>
                        <span className="text-[9px] font-mono leading-none py-1 px-2 rounded bg-amber-500/20 uppercase font-bold">Busy</span>
                      </button>

                      <button
                        onClick={() => setProviderAvailability('offline')}
                        className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold border text-left flex items-center justify-between transition cursor-pointer ${
                          providerAvailability === 'offline'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-slate-950 border-slate-860 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        <span className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-slate-600 mr-2.5" />
                          <span>Offline / Rest/ Off-Duty</span>
                        </span>
                        <span className="text-[9px] font-mono leading-none py-1 px-2 rounded bg-slate-800 uppercase font-bold">Offline</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">Changing status updates the live search directory instantly. We advise keeping your status active when within your preferred service area.</p>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* -------------------------------------------------------------
              C. ADMINISTRATOR ROLE VIEWS
              ------------------------------------------------------------- */}
          {user.role === 'admin' && (
            <div className="space-y-6 animate-fade-in">

              {/* Users Tab: Account Moderations and bans */}
              {activeTab === 'users' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Account directory (8 cols) */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                      <div>
                        <h3 className="font-display font-extrabold text-base text-white">Member Accounts Directory</h3>
                        <p className="text-xs text-slate-500">Approve accounts or block users violating service standards.</p>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-slate-950 text-slate-400 font-bold font-mono">
                          <tr>
                            <th className="p-4 uppercase tracking-wider text-[10px]">Name</th>
                            <th className="p-4 uppercase tracking-wider text-[10px]">Email</th>
                            <th className="p-4 uppercase tracking-wider text-[10px]">Role</th>
                            <th className="p-4 uppercase tracking-wider text-[10px]">Status</th>
                            <th className="p-4 text-right uppercase tracking-wider text-[10px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {users.map(u => {
                            const isExpanded = expandedUserId === u.id || expandedUserId === u._id;
                            const expDetails = u.role === 'provider' ? (u.providerDetails || experts.find(e => e.id === u.id || e._id === u.id || e.email === u.email)?.providerDetails) : null;
                            
                            return (
                              <React.Fragment key={u.id}>
                                <tr className={`hover:bg-slate-900/25 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-900/20' : ''}`} onClick={() => setExpandedUserId(isExpanded ? null : u.id)}>
                                  <td className="p-4">
                                    <div className="flex items-center space-x-3">
                                      <img
                                        src={u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}&backgroundColor=f59e0b&textColor=0f172a`}
                                        alt={u.name}
                                        referrerPolicy="no-referrer"
                                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-800"
                                      />
                                      <div>
                                        <span className="font-bold text-white block text-xs hover:text-amber-400 transition">{u.name}</span>
                                        {u.role === 'provider' && expDetails && (
                                          <span className="text-[9px] text-amber-500 font-mono font-black uppercase tracking-wider">{expDetails.category} Specialist</span>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4 font-mono text-slate-450">{u.email}</td>
                                  <td className="p-4 capitalize">
                                    <span className={`py-0.5 px-2 rounded-md font-mono text-[9px] font-bold ${
                                      u.role === 'admin' ? 'bg-rose-500/10 text-rose-450' :
                                      u.role === 'provider' ? 'bg-amber-500/10 text-amber-450' : 'bg-blue-500/10 text-blue-450'
                                    }`}>
                                      {u.role}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className={`py-0.5 px-2 rounded-full text-[9px] font-mono font-bold ${
                                      u.isSuspended ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                                    }`}>
                                      {u.isSuspended ? 'Suspended' : 'Active'}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end space-x-2">
                                      <button
                                        onClick={() => setExpandedUserId(isExpanded ? null : u.id)}
                                        className="text-[10px] font-bold py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                                      >
                                        {isExpanded ? 'Hide Info' : 'View Profile'}
                                      </button>
                                      <button
                                        onClick={() => handleToggleSuspension(u.id)}
                                        className={`text-[10px] font-bold py-1.5 px-3 rounded-lg transition cursor-pointer ${
                                          u.isSuspended 
                                            ? 'bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400'
                                            : 'bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400'
                                        }`}
                                      >
                                        {u.isSuspended ? 'Unblock' : 'Block'}
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                                
                                {isExpanded && (
                                  <tr className="bg-slate-950/80" onClick={(e) => e.stopPropagation()}>
                                    <td colSpan={5} className="p-5 border-t border-b border-slate-850">
                                      <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-800 space-y-4 animate-fade-in text-xs">
                                        <div className="flex flex-col md:flex-row gap-5 items-start">
                                          {/* Profile Picture */}
                                          <div className="w-24 h-24 rounded-xl overflow-hidden ring-2 ring-slate-800 bg-slate-950 shrink-0 self-center md:self-start">
                                            <img
                                              src={u.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}&backgroundColor=f59e0b&textColor=0f172a`}
                                              alt={u.name}
                                              referrerPolicy="no-referrer"
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                          
                                          {/* Profile Info */}
                                          <div className="flex-1 space-y-3 w-full">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                              <div>
                                                <h4 className="text-base font-black text-white">{u.name}</h4>
                                                <p className="text-xs text-slate-400 font-medium">Contact: {u.phone || 'No phone registered'} | Address: {u.address || 'No base address'}</p>
                                              </div>
                                              
                                              {u.role === 'provider' && expDetails && (
                                                <div className="flex items-center space-x-2">
                                                  {expDetails.isVerified ? (
                                                    <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1 px-2.5 rounded-lg uppercase">
                                                      ✓ Verified Provider
                                                    </span>
                                                  ) : (
                                                    <span className="text-[9px] font-mono font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 py-1 px-2.5 rounded-lg uppercase animate-pulse">
                                                      ⚠ Verification Pending
                                                    </span>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                            
                                            {u.role === 'provider' && expDetails ? (
                                              <div className="space-y-3.5">
                                                {/* Bio */}
                                                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                                                  <p className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider mb-1">Provider Biography</p>
                                                  <p className="text-xs text-slate-300 leading-relaxed italic">"{expDetails.bio || 'No bio written yet.'}"</p>
                                                </div>
                                                
                                                {/* Stats grid */}
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60">
                                                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono block">Category</span>
                                                    <span className="text-xs font-bold text-amber-400 block mt-0.5">{expDetails.category}</span>
                                                  </div>
                                                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60">
                                                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono block">Hourly Rate</span>
                                                    <span className="text-xs font-black text-white font-mono block mt-0.5">₹{expDetails.rate}/hr</span>
                                                  </div>
                                                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60">
                                                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono block">Performance</span>
                                                    <span className="text-xs font-bold text-white font-mono block mt-0.5">⭐ {expDetails.rating || '5.0'} ({expDetails.ratingsCount || 0} reviews)</span>
                                                  </div>
                                                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850/60">
                                                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono block">Completed Jobs / Earnings</span>
                                                    <span className="text-xs font-bold text-emerald-400 font-mono block mt-0.5">{expDetails.completedJobs || 0} Jobs (₹{expDetails.earnings || 0})</span>
                                                  </div>
                                                </div>
                                                
                                                {/* Skills tags */}
                                                {expDetails.skills && expDetails.skills.length > 0 && (
                                                  <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider mb-1.5">Expertise Tags & Skills</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                      {expDetails.skills.map((skill, sIdx) => (
                                                        <span key={sIdx} className="bg-slate-950 text-slate-400 font-mono text-[9px] py-1 px-2.5 rounded-lg border border-slate-850 font-medium">
                                                          #{skill}
                                                        </span>
                                                      ))}
                                                    </div>
                                                  </div>
                                                )}
                                                
                                                {/* Pending action */}
                                                {!expDetails.isVerified && (
                                                  <div className="flex justify-end pt-1">
                                                    <button
                                                      onClick={() => handleApproveProvider(u.id)}
                                                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black py-2 px-4 rounded-xl transition cursor-pointer"
                                                    >
                                                      Verify & Approve Profile
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            ) : (
                                              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850 text-slate-400 text-[11px]">
                                                This account is registered as a <span className="text-blue-400 capitalize font-bold">{u.role}</span> member. Service provider metrics, earnings, and bio are only active for expert technician accounts.
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Active Platform Volume Dashboard (4 cols) */}
                  <div className="lg:col-span-4 space-y-4">
                    <h4 className="font-display font-bold text-sm text-white">Platform Summary</h4>
                    <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Registered Members</span>
                          <span className="block text-lg font-black text-white mt-1">{users.length} Active Accounts</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Active Dispatch Volume</span>
                          <span className="block text-lg font-black text-amber-400 font-mono mt-1">₹{bookings.reduce((sum, b) => sum + b.cost, 0)}</span>
                        </div>
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-850">
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Dispatched Jobs</span>
                          <span className="block text-lg font-black text-emerald-400 mt-1">{bookings.length} assignments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Approvals Tab: Verify providers */}
              {activeTab === 'approvals' && (
                <div className="max-w-xl space-y-6 animate-fade-in">
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-white">Pending Specialist Registrations</h3>
                    <p className="text-xs text-slate-400">Verify skills and biography claims before making profiles live in the search directory.</p>
                  </div>

                  <div className="space-y-3.5">
                    {experts.filter(exp => !exp.providerDetails.isVerified).map(exp => (
                      <div key={exp.id} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="text-sm font-black text-white">{exp.name}</h5>
                            <span className="text-[10px] text-amber-400 font-mono tracking-wider font-bold block mt-1">{exp.providerDetails.category} Specialist</span>
                          </div>
                          <span className="text-xs font-mono text-slate-500 font-bold">Hourly Rate: ₹{exp.providerDetails.rate}/hr</span>
                        </div>
                        
                        <p className="text-xs text-slate-450 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-850">{exp.providerDetails.bio}</p>
                        
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleApproveProvider(exp.id)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black py-2 px-4 rounded-xl transition cursor-pointer"
                          >
                            Verify & Approve Profile
                          </button>
                        </div>
                      </div>
                    ))}

                    {experts.filter(exp => !exp.providerDetails.isVerified).length === 0 && (
                      <div className="p-8 text-center bg-slate-900/20 border border-slate-900/40 rounded-2xl">
                        <p className="text-xs text-slate-500">All registered service experts have been fully verified.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Profile Tab: View and update user profile & profile picture */}
              {activeTab === 'profile' && (
                <div className="max-w-3xl space-y-8 animate-fade-in">
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-white">My Profile Settings</h3>
                    <p className="text-xs text-slate-400">Manage your account information, service expert criteria, and profile display image.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Avatar and Stats */}
                    <div className="space-y-6 md:col-span-1">
                      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center text-center">
                        <div className="relative group w-32 h-32 rounded-2xl overflow-hidden mb-4 ring-4 ring-slate-800 bg-slate-950 flex items-center justify-center">
                          <img
                            src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=f59e0b&textColor=0f172a`}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                          {uploadingDp ? (
                            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-white">
                              <span className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-1" />
                              <span className="text-[10px] text-slate-300 font-bold">Uploading...</span>
                            </div>
                          ) : (
                            <label className="absolute inset-0 bg-slate-950/65 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center cursor-pointer text-white">
                              <Camera className="w-6 h-6 text-amber-500 mb-1" />
                              <span className="text-[9px] font-bold uppercase tracking-wider">Change Picture</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfileImageUpload}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white">{user.name}</h4>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                          <div className="pt-2">
                            <span className="inline-block text-[10px] font-mono leading-none py-1.5 px-3 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                              {user.role === 'provider' ? 'Service Provider' : user.role === 'customer' ? 'Customer' : 'System Admin'}
                            </span>
                          </div>
                        </div>

                        {user.role === 'provider' && (
                          <div className="w-full mt-6 pt-5 border-t border-slate-800/80 space-y-4 text-left">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-450 font-bold flex items-center">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mr-1.5" />
                                Verification:
                              </span>
                              {user.providerDetails?.isVerified ? (
                                <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1 px-2 rounded-lg uppercase">Verified</span>
                              ) : (
                                <span className="text-[9px] font-mono font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 py-1 px-2 rounded-lg uppercase">Pending</span>
                              )}
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-450 font-bold flex items-center">
                                <Star className="w-3.5 h-3.5 text-amber-400 mr-1.5 fill-amber-400/20" />
                                Rating:
                              </span>
                              <span className="text-white font-mono font-bold">{user.providerDetails?.rating || '5.0'} ★ ({user.providerDetails?.ratingsCount || 0})</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-450 font-bold flex items-center">
                                <Briefcase className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
                                Jobs Done:
                              </span>
                              <span className="text-white font-mono font-bold">{user.providerDetails?.completedJobs || 0} Jobs</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-450 font-bold flex items-center">
                                <DollarSign className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
                                Earnings:
                              </span>
                              <span className="text-amber-500 font-mono font-black">₹{user.providerDetails?.earnings || 0}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Display quick instructions for DP upload */}
                      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4.5 text-[11px] leading-relaxed text-slate-450">
                        <div className="flex items-center space-x-2 text-white font-black mb-1.5">
                          <Upload className="w-3.5 h-3.5 text-amber-500" />
                          <span>Profile Photo Tips</span>
                        </div>
                        <p>Hover over the picture container above to instantly upload or change your profile picture. High quality portraits get 3x more service bookings!</p>
                      </div>
                    </div>

                    {/* Right Column: Update Forms */}
                    <div className="space-y-6 md:col-span-2">
                      {/* Main profile form */}
                      <form onSubmit={handleUpdateProfile} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800/80">
                          <User className="w-4.5 h-4.5 text-amber-500" />
                          <h4 className="text-sm font-black text-white">General Information</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                            <input
                              type="text"
                              required
                              value={profileForm.name}
                              onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                            <input
                              type="email"
                              disabled
                              value={user.email}
                              className="w-full bg-slate-950/60 border border-slate-850 rounded-xl py-2.5 px-3.5 text-xs text-slate-500 cursor-not-allowed focus:outline-none"
                              title="Email address cannot be changed."
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                            <input
                              type="tel"
                              required
                              placeholder="e.g. 9876543210"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Base Location</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Sector 62, Noida"
                              value={profileForm.address}
                              onChange={(e) => setProfileForm(p => ({ ...p, address: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                            />
                          </div>
                        </div>

                        {user.role === 'provider' && (
                          <div className="space-y-5 pt-4 border-t border-slate-800/80">
                            <div className="flex items-center space-x-2.5 pb-2">
                              <Briefcase className="w-4.5 h-4.5 text-amber-500" />
                              <h4 className="text-sm font-black text-white">Expertise & Service Criteria</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Category</label>
                                <select
                                  value={profileForm.category}
                                  onChange={(e) => setProfileForm(p => ({ ...p, category: e.target.value }))}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 transition"
                                >
                                  {SERVICE_CATEGORIES.map(cat => (
                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hourly Rate (₹/hr)</label>
                                <input
                                  type="number"
                                  required
                                  min="50"
                                  max="2000"
                                  value={profileForm.rate}
                                  onChange={(e) => setProfileForm(p => ({ ...p, rate: e.target.value }))}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specific Skills (Comma-separated)</label>
                              <input
                                type="text"
                                placeholder="e.g. Copper pipes, Drainage, Leakages, Tap Installation"
                                value={profileForm.skills}
                                onChange={(e) => setProfileForm(p => ({ ...p, skills: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Short Bio / Experience summary</label>
                              <textarea
                                rows="3"
                                placeholder="Describe your experience, working hours, or specialized services..."
                                value={profileForm.bio}
                                onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition resize-none"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end pt-3">
                          <button
                            type="submit"
                            disabled={savingProfile}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 px-6 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                          >
                            {savingProfile ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                                <span>Saving details...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Update Profile Details</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>

                      {/* Password reset form */}
                      <form onSubmit={handleChangePasswordSubmit} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-5">
                        <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800/80">
                          <Key className="w-4.5 h-4.5 text-amber-500" />
                          <h4 className="text-sm font-black text-white">Security & Password</h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                            <input
                              type="password"
                              required
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 transition"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                            <input
                              type="password"
                              required
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 transition"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                            <input
                              type="password"
                              required
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-amber-500 transition"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-3">
                          <button
                            type="submit"
                            disabled={changingPassword}
                            className="bg-slate-850 hover:bg-slate-800 border border-slate-800 text-white font-bold text-xs py-3 px-6 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                          >
                            {changingPassword ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Updating password...</span>
                              </>
                            ) : (
                              <>
                                <Key className="w-4 h-4 text-amber-500" />
                                <span>Change Password</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

    </div>
  );
}
