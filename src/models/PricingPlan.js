import mongoose from 'mongoose';

const PricingPlanSchema = new mongoose.Schema({
  planType: {
    type: String,
    enum: ['FREE', 'BASIC', 'PREMIUM'],
    required: true,
    unique: true,
    index: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  monthlyPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  yearlyPrice: {
    type: Number,
    required: false,
    min: 0,
  },
  setupFee: {
    type: Number,
    default: 0,
    min: 0,
  },

  // Plan limits
  limits: {
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
    maxOrderValue: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
    maxBookingValue: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
    maxGuestCountPerBooking: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
  },

  // Discount and rewards
  discounts: {
    orderDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    bookingDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    specialEventDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    loyaltyPointsMultiplier: {
      type: Number,
      default: 1,
      min: 1,
    },
    referralBonus: {
      type: Number,
      default: 0,
      min: 0,
    },
  },

  // Features
  features: {
    freeDelivery: {
      type: Boolean,
      default: false,
    },
    freeDeliveryOrderValue: {
      type: Number,
      default: 0, // minimum order value for free delivery
      min: 0,
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
    priorityProcessing: {
      type: Boolean,
      default: false,
    },
    earlyAccessToEvents: {
      type: Boolean,
      default: false,
    },
    customCatering: {
      type: Boolean,
      default: false,
    },
    venueDecorationOptions: {
      type: Boolean,
      default: false,
    },
    personalizedMenu: {
      type: Boolean,
      default: false,
    },
    advancedFiltering: {
      type: Boolean,
      default: false,
    },
    bulkOrdering: {
      type: Boolean,
      default: false,
    },
    reservedTables: {
      type: Boolean,
      default: false,
    },
  },

  // Support and service level
  support: {
    level: {
      type: String,
      enum: ['BASIC', 'STANDARD', 'PRIORITY', 'VIP'],
      default: 'BASIC',
    },
    responseTime: {
      type: String, // e.g., "24 hours", "2 hours"
      default: '24 hours',
    },
    emailSupport: {
      type: Boolean,
      default: true,
    },
    phoneSupport: {
      type: Boolean,
      default: false,
    },
    chatSupport: {
      type: Boolean,
      default: false,
    },
    dedicatedAccountManager: {
      type: Boolean,
      default: false,
    },
  },

  // Payment terms
  paymentTerms: {
    trialPeriodDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    billingCycle: {
      type: String,
      enum: ['MONTHLY', 'YEARLY'],
      default: 'MONTHLY',
    },
    autoRenewal: {
      type: Boolean,
      default: true,
    },
    discountOnYearlyBilling: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },

  // Conditions and restrictions
  conditions: {
    minimumCommitmentMonths: {
      type: Number,
      default: 0,
      min: 0,
    },
    cancellationFeeDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    cancellationFeePercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    eligibilityRestrictions: [String], // e.g., ['New customers only', 'Certain regions']
  },

  // Status and timestamps
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  launchedAt: {
    type: Date,
    required: false,
  },
  discontinuedAt: {
    type: Date,
    required: false,
  },

  // Metadata
  notes: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0, // for display order
  },
});

// Auto-update the updatedAt field
PricingPlanSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.PricingPlan || mongoose.model('PricingPlan', PricingPlanSchema);
