import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const AddressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  isDefault: { type: Boolean, default: false }
});

const ProviderDetailsSchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true,
    enum: ['Electrician', 'Plumber', 'Mechanic', 'Cook / Chef', 'Cleaner / Maid', 'Painter', 'Mistri (Mason)', 'Labour (Helper)', 'General']
  },
  skills: [{ type: String }],
  rate: { type: Number, required: true, default: 200 }, // Hourly rate in INR
  rating: { type: Number, default: 5.0 },
  ratingsCount: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  availability: { 
    type: String, 
    enum: ['available', 'busy', 'offline'], 
    default: 'available' 
  },
  completedJobs: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  bio: { type: String }
});

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please add a name'] 
  },
  email: { 
    type: String, 
    required: [true, 'Please add an email'], 
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: { 
    type: String, 
    required: [true, 'Please add a password'], 
    minlength: 6,
    select: false // Exclude password field by default
  },
  role: { 
    type: String, 
    required: true, 
    enum: ['customer', 'provider', 'admin'],
    default: 'customer' 
  },
  phone: { 
    type: String, 
    required: [true, 'Please add a phone number'] 
  },
  address: { type: String }, // General main address
  addresses: [AddressSchema], // Saved shipping/delivery addresses (Phase 3)
  profileImage: { type: String },
  providerDetails: ProviderDetailsSchema,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isSuspended: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now }
});

// Encrypt password using bcrypt pre-save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
