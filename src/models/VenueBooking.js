import mongoose from 'mongoose';

const VenueBookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  eventName: {
    type: String,
    required: true,
  },
  eventType: {
    type: String,
    enum: ['Wedding', 'Corporate', 'Birthday', 'Anniversary', 'Other'],
    required: true,
  },
  guestCount: {
    type: Number,
    required: true,
    min: 1,
    max: 500,
  },
  eventDate: {
    type: Date,
    required: true,
    index: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    default: 3,
  },
  venue: {
    type: String,
    enum: ['Indoor', 'Outdoor', 'Both'],
    default: 'Indoor',
  },
  customerInfo: {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
  },
  estimatedBudget: {
    type: Number,
    required: false,
  },
  totalCost: {
    type: Number,
    required: false,
    min: 0,
  },
  originalCost: {
    type: Number,
    required: false,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  planType: {
    type: String,
    enum: ['FREE', 'BASIC', 'PREMIUM'],
    default: 'FREE',
    index: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    default: 'Pending',
    index: true,
  },
  specialRequests: {
    type: String,
    default: '',
  },
  menuPreferences: {
    type: String,
    default: '',
  },
  decorationRequested: {
    type: Boolean,
    default: false,
  },
  cateringDetails: {
    type: String,
    default: '',
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Advance Paid', 'Fully Paid', 'Failed'],
    default: 'Pending',
  },
  advanceAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  confirmedAt: {
    type: Date,
    required: false,
  },
  completedAt: {
    type: Date,
    required: false,
  },
});

// Auto-update the updatedAt field
VenueBookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.VenueBooking || mongoose.model('VenueBooking', VenueBookingSchema);
