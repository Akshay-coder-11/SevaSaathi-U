import mongoose from 'mongoose';

const EmailLogSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'failed', 'simulated'],
    default: 'pending'
  },
  smtpResponse: {
    type: String
  },
  errorMessage: {
    type: String
  },
  smtpConfig: {
    host: String,
    port: Number,
    service: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const EmailLog = mongoose.models.EmailLog || mongoose.model('EmailLog', EmailLogSchema);
export default EmailLog;
