import mongoose from 'mongoose';

const WhatsAppAuthSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
  },
  verificationCode: {
    type: String,
    required: true,
  },
  verificationLink: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900, // Auto-delete after 15 minutes
  },
}, { timestamps: true });

export default mongoose.models.WhatsAppAuth || mongoose.model('WhatsAppAuth', WhatsAppAuthSchema);
