import mongoose from 'mongoose';

const MembershipSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true,
    index: true,
  },
  customerNumber: {
    type: String,
    required: true,
  },
  planType: {
    type: String,
    enum: ['BASIC', 'PREMIUM'],
    required: true,
  },
  planStatus: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED'],
    default: 'ACTIVE',
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PAID',
  },
  paymentMethod: {
    type: String,
    enum: ['ONLINE', 'IN_PERSON'],
    default: 'ONLINE',
  },
  paymentDetails: {
    type: String,
    default: '',
  },
  planStartDate: {
    type: Date,
    default: Date.now,
  },
  planEndDate: {
    type: Date,
    required: true,
  },
  verifiedName: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  aadhaarLastFour: {
    type: String,
    required: true,
  },
  aadhaarImage: {
    type: String, // Secure filename on disk
    required: true,
  },
  isAgeVerified: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Auto-update updatedAt
MembershipSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Membership || mongoose.model('Membership', MembershipSchema);
