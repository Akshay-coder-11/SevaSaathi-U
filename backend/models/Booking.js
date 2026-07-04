import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  expertId: { type: String, required: true },
  expertName: { type: String, required: true },
  category: { type: String, required: true },
  hours: { type: Number, required: true, default: 2 },
  cost: { type: Number, required: true },
  instructions: { type: String, default: 'No instructions provided.' },
  address: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
export default Booking;
