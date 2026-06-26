import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  //Customer identification
  customerNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  address: {
    type: String,
    required: false,
  },

  // Plan Information
  planType: {
    type: String,
    enum: ['FREE', 'MEMBERSHIP'],
    default: 'FREE',
    index: true,
  },
  planStartDate: {
    type: Date,
    default: Date.now,
  },
  planEndDate: {
    type: Date,
    required: false,
  },
  planStatus: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'EXPIRED', 'CANCELLED'],
    default: 'ACTIVE',
    index: true,
  },

  // Plan specific limits and features
  planFeatures: {
    maxOrdersPerMonth: {
      type: Number,
      required: true,
      default: 0,
    },
    maxBookingsPerMonth: {
      type: Number,
      required: true,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    priorityLevel: {
      type: String,
      enum: ['STANDARD', 'PRIORITY', 'VIP'],
      default: 'STANDARD',
    },
    freeDelivery: {
      type: Boolean,
      default: false,
    },
    specialEventDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    accessToPremiumMenu: {
      type: Boolean,
      default: false,
    },
    personalizedRecommendations: {
      type: Boolean,
      default: false,
    },
    dedicatedSupport: {
      type: Boolean,
      default: false,
    },
    earlyAccessToEvents: {
      type: Boolean,
      default: false,
    },
  },

  // Usage tracking
  usageMetrics: {
    ordersThisMonth: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookingsThisMonth: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalOrdersAllTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalBookingsAllTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

  // Loyalty and rewards
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalRewardsEarned: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalRewardsRedeemed: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Preferences and settings
  preferences: {
    preferredOrderType: {
      type: String,
      enum: ['Dine-in', 'Takeaway', 'Delivery'],
      default: 'Dine-in',
    },
    dietary: [String], // e.g., ['Vegetarian', 'Gluten-free']
    cuisinePreferences: [String],
    notificationPreference: {
      type: String,
      enum: ['WhatsApp', 'SMS', 'None'],
      default: 'WhatsApp',
    },
  },

  // Status and timestamps
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'BLACKLISTED'],
    default: 'ACTIVE',
    index: true,
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
  lastActivityAt: {
    type: Date,
    required: false,
  },

  // Additional metadata
  notes: {
    type: String,
    default: '',
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: false,
  },
});

// Auto-update the updatedAt field
CustomerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  this.lastActivityAt = Date.now();
  next();
});

// Index for phone and plan search
CustomerSchema.index({ phone: 1, planType: 1 });
CustomerSchema.index({ planStatus: 1, status: 1 });

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
