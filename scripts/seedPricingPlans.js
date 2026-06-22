/**
 * Seed Script - Initialize Pricing Plans
 * Run this script to set up default pricing plans in the database
 * Usage: node scripts/seedPricingPlans.js
 */

import mongoose from 'mongoose';
import PricingPlan from '../src/models/PricingPlan.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dharshan:grove123@cluster0.cqnmwfz.mongodb.net/?appName=Cluster0';

async function seedPricingPlans() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing plans (optional - comment out to keep existing)
    // await PricingPlan.deleteMany({});
    // console.log('🗑️  Cleared existing pricing plans');

    // Default pricing plans
    const plans = [
      {
        planType: 'FREE',
        displayName: 'Free Plan',
        description: 'Basic features for casual customers',
        monthlyPrice: 0,
        setupFee: 0,
        limits: {
          maxOrdersPerMonth: 5,
          maxBookingsPerMonth: 1,
          maxOrderValue: 1000,
          maxBookingValue: 5000,
          maxGuestCountPerBooking: 20,
        },
        discounts: {
          orderDiscount: 0,
          bookingDiscount: 0,
          specialEventDiscount: 0,
          loyaltyPointsMultiplier: 1,
          referralBonus: 0,
        },
        features: {
          freeDelivery: false,
          freeDeliveryOrderValue: 0,
          accessToPremiumMenu: false,
          personalizedRecommendations: false,
          dedicatedSupport: false,
          priorityProcessing: false,
          earlyAccessToEvents: false,
          customCatering: false,
          venueDecorationOptions: false,
          personalizedMenu: false,
          advancedFiltering: false,
          bulkOrdering: false,
          reservedTables: false,
        },
        support: {
          level: 'BASIC',
          responseTime: '48 hours',
          emailSupport: false,
          phoneSupport: false,
          chatSupport: false,
          dedicatedAccountManager: false,
        },
        paymentTerms: {
          trialPeriodDays: 0,
          billingCycle: 'MONTHLY',
          autoRenewal: false,
          discountOnYearlyBilling: 0,
        },
        isActive: true,
        order: 1,
      },
      {
        planType: 'BASIC',
        displayName: 'Basic Plan',
        description: 'Perfect for regular customers and small gatherings',
        monthlyPrice: 99,
        yearlyPrice: 990,
        setupFee: 0,
        limits: {
          maxOrdersPerMonth: 20,
          maxBookingsPerMonth: 5,
          maxOrderValue: 5000,
          maxBookingValue: 25000,
          maxGuestCountPerBooking: 100,
        },
        discounts: {
          orderDiscount: 10,
          bookingDiscount: 5,
          specialEventDiscount: 5,
          loyaltyPointsMultiplier: 1.5,
          referralBonus: 200,
        },
        features: {
          freeDelivery: false,
          freeDeliveryOrderValue: 500,
          accessToPremiumMenu: false,
          personalizedRecommendations: true,
          dedicatedSupport: false,
          priorityProcessing: false,
          earlyAccessToEvents: false,
          customCatering: false,
          venueDecorationOptions: false,
          personalizedMenu: false,
          advancedFiltering: true,
          bulkOrdering: false,
          reservedTables: true,
        },
        support: {
          level: 'STANDARD',
          responseTime: '24 hours',
          emailSupport: true,
          phoneSupport: false,
          chatSupport: true,
          dedicatedAccountManager: false,
        },
        paymentTerms: {
          trialPeriodDays: 7,
          billingCycle: 'MONTHLY',
          autoRenewal: true,
          discountOnYearlyBilling: 10,
        },
        conditions: {
          minimumCommitmentMonths: 0,
          cancellationFeeDays: 0,
          cancellationFeePercentage: 0,
          eligibilityRestrictions: [],
        },
        isActive: true,
        order: 2,
      },
      {
        planType: 'PREMIUM',
        displayName: 'Premium Plan',
        description: 'Complete solution for VIP customers and large events',
        monthlyPrice: 499,
        yearlyPrice: 4990,
        setupFee: 500,
        limits: {
          maxOrdersPerMonth: 0, // Unlimited
          maxBookingsPerMonth: 0, // Unlimited
          maxOrderValue: 0, // Unlimited
          maxBookingValue: 0, // Unlimited
          maxGuestCountPerBooking: 0, // Unlimited
        },
        discounts: {
          orderDiscount: 20,
          bookingDiscount: 15,
          specialEventDiscount: 25,
          loyaltyPointsMultiplier: 3,
          referralBonus: 500,
        },
        features: {
          freeDelivery: true,
          freeDeliveryOrderValue: 0,
          accessToPremiumMenu: true,
          personalizedRecommendations: true,
          dedicatedSupport: true,
          priorityProcessing: true,
          earlyAccessToEvents: true,
          customCatering: true,
          venueDecorationOptions: true,
          personalizedMenu: true,
          advancedFiltering: true,
          bulkOrdering: true,
          reservedTables: true,
        },
        support: {
          level: 'VIP',
          responseTime: '2 hours',
          emailSupport: true,
          phoneSupport: true,
          chatSupport: true,
          dedicatedAccountManager: true,
        },
        paymentTerms: {
          trialPeriodDays: 14,
          billingCycle: 'MONTHLY',
          autoRenewal: true,
          discountOnYearlyBilling: 20,
        },
        conditions: {
          minimumCommitmentMonths: 3,
          cancellationFeeDays: 30,
          cancellationFeePercentage: 10,
          eligibilityRestrictions: [],
        },
        isActive: true,
        order: 3,
      },
    ];

    // Create or update plans
    for (const planData of plans) {
      const existing = await PricingPlan.findOne({ planType: planData.planType });

      if (existing) {
        // Update existing plan
        await PricingPlan.updateOne({ planType: planData.planType }, planData);
        console.log(`✏️  Updated plan: ${planData.planType}`);
      } else {
        // Create new plan
        const plan = new PricingPlan(planData);
        await plan.save();
        console.log(`✅ Created plan: ${planData.planType}`);
      }
    }

    console.log('\n✅ Pricing plans seeded successfully!');

    // Display created plans
    const allPlans = await PricingPlan.find({ isActive: true }).sort('order');
    console.log('\n📋 Pricing Plans:');
    allPlans.forEach((plan) => {
      console.log(`\n🏷️  ${plan.displayName} (${plan.planType})`);
      console.log(`   Price: ₹${plan.monthlyPrice}/month`);
      console.log(`   Orders/month: ${plan.limits.maxOrdersPerMonth || 'Unlimited'}`);
      console.log(`   Bookings/month: ${plan.limits.maxBookingsPerMonth || 'Unlimited'}`);
      console.log(`   Discount: ${plan.discounts.orderDiscount}%`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding pricing plans:', error);
    process.exit(1);
  }
}

seedPricingPlans();
