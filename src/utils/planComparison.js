/**
 * Plan Comparison and Validation Utility
 * Compares customer phone plan against orders and bookings
 */

import Customer from '@/models/Customer';
import PricingPlan from '@/models/PricingPlan';

/**
 * Get customer by phone number
 */
export async function getCustomerByPhone(phone) {
  try {
    const customer = await Customer.findOne({ phone });
    return customer;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
}

/**
 * Get pricing plan details
 */
export async function getPricingPlan(planType) {
  try {
    const plan = await PricingPlan.findOne({ planType, isActive: true });
    return plan;
  } catch (error) {
    console.error('Error fetching pricing plan:', error);
    throw error;
  }
}

/**
 * Validate order against customer plan
 */
export async function validateOrderAgainstPlan(phone, orderData) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    applicableDiscounts: {
      discountPercentage: 0,
      discountAmount: 0,
    },
    finalPrice: orderData.totalPrice || 0,
    planInfo: null,
    customerInfo: null,
  };

  try {
    // Get customer
    const customer = await getCustomerByPhone(phone);
    if (!customer) {
      validation.isValid = true; // Allow creation of new customer
      validation.warnings.push('New customer detected - registering with FREE plan');
      return validation;
    }

    validation.customerInfo = {
      name: customer.name,
      planType: customer.planType,
      planStatus: customer.planStatus,
    };

    // Check plan status
    if (customer.planStatus !== 'ACTIVE') {
      validation.isValid = false;
      validation.errors.push(`Customer plan is ${customer.planStatus}`);
      return validation;
    }

    // Get plan details
    const plan = await getPricingPlan(customer.planType);
    if (!plan) {
      validation.errors.push('Invalid pricing plan configuration');
      validation.isValid = false;
      return validation;
    }

    validation.planInfo = {
      planType: plan.planType,
      displayName: plan.displayName,
      limits: plan.limits,
      features: plan.features,
    };

    // Check order limit
    if (
      plan.limits.maxOrdersPerMonth > 0 &&
      customer.usageMetrics.ordersThisMonth >= plan.limits.maxOrdersPerMonth
    ) {
      validation.isValid = false;
      validation.errors.push(
        `Monthly order limit (${plan.limits.maxOrdersPerMonth}) exceeded`
      );
      return validation;
    }

    // Check order value limit
    if (
      plan.limits.maxOrderValue > 0 &&
      orderData.totalPrice > plan.limits.maxOrderValue
    ) {
      validation.isValid = false;
      validation.errors.push(
        `Order exceeds plan limit of ₹${plan.limits.maxOrderValue}`
      );
      return validation;
    }

    // Calculate discounts
    const discountPercentage = plan.discounts.orderDiscount || 0;
    const discountAmount = (orderData.totalPrice * discountPercentage) / 100;
    validation.applicableDiscounts = {
      discountPercentage,
      discountAmount,
    };

    validation.finalPrice = orderData.totalPrice - discountAmount;

    // Add warnings for plan limits
    if (
      plan.limits.maxOrdersPerMonth > 0 &&
      customer.usageMetrics.ordersThisMonth >=
        plan.limits.maxOrdersPerMonth * 0.8
    ) {
      validation.warnings.push(
        `Warning: ${
          plan.limits.maxOrdersPerMonth -
          customer.usageMetrics.ordersThisMonth
        } orders remaining this month`
      );
    }

    return validation;
  } catch (error) {
    console.error('Error validating order:', error);
    validation.isValid = false;
    validation.errors.push(`Validation error: ${error.message}`);
    return validation;
  }
}

/**
 * Validate booking against customer plan
 */
export async function validateBookingAgainstPlan(phone, bookingData) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    applicableDiscounts: {
      discountPercentage: 0,
      discountAmount: 0,
    },
    finalPrice: bookingData.totalCost || 0,
    planInfo: null,
    customerInfo: null,
  };

  try {
    // Get customer
    const customer = await getCustomerByPhone(phone);
    if (!customer) {
      validation.isValid = true; // Allow creation of new customer
      validation.warnings.push('New customer detected - registering with FREE plan');
      return validation;
    }

    validation.customerInfo = {
      name: customer.name,
      planType: customer.planType,
      planStatus: customer.planStatus,
    };

    // Check plan status
    if (customer.planStatus !== 'ACTIVE') {
      validation.isValid = false;
      validation.errors.push(`Customer plan is ${customer.planStatus}`);
      return validation;
    }

    // Get plan details
    const plan = await getPricingPlan(customer.planType);
    if (!plan) {
      validation.errors.push('Invalid pricing plan configuration');
      validation.isValid = false;
      return validation;
    }

    validation.planInfo = {
      planType: plan.planType,
      displayName: plan.displayName,
      limits: plan.limits,
      features: plan.features,
    };

    // Check booking limit
    if (
      plan.limits.maxBookingsPerMonth > 0 &&
      customer.usageMetrics.bookingsThisMonth >= plan.limits.maxBookingsPerMonth
    ) {
      validation.isValid = false;
      validation.errors.push(
        `Monthly booking limit (${plan.limits.maxBookingsPerMonth}) exceeded`
      );
      return validation;
    }

    // Check guest count limit
    if (
      plan.limits.maxGuestCountPerBooking > 0 &&
      bookingData.guestCount > plan.limits.maxGuestCountPerBooking
    ) {
      validation.isValid = false;
      validation.errors.push(
        `Guest count exceeds plan limit of ${plan.limits.maxGuestCountPerBooking}`
      );
      return validation;
    }

    // Check booking value limit
    if (
      plan.limits.maxBookingValue > 0 &&
      bookingData.totalCost > plan.limits.maxBookingValue
    ) {
      validation.isValid = false;
      validation.errors.push(
        `Booking cost exceeds plan limit of ₹${plan.limits.maxBookingValue}`
      );
      return validation;
    }

    // Check for premium features if not in plan
    if (
      bookingData.decorationRequested &&
      !plan.features.venueDecorationOptions
    ) {
      validation.warnings.push(
        'Venue decoration requires PREMIUM plan - additional cost may apply'
      );
    }

    if (
      bookingData.personalizedMenu &&
      !plan.features.personalizedMenu
    ) {
      validation.warnings.push(
        'Personalized menu requires PREMIUM plan - additional cost may apply'
      );
    }

    // Calculate discounts
    const discountPercentage = plan.discounts.bookingDiscount || 0;
    const discountAmount = (bookingData.totalCost * discountPercentage) / 100;
    validation.applicableDiscounts = {
      discountPercentage,
      discountAmount,
    };

    validation.finalPrice = bookingData.totalCost - discountAmount;

    // Add warnings
    if (
      plan.limits.maxBookingsPerMonth > 0 &&
      customer.usageMetrics.bookingsThisMonth >=
        plan.limits.maxBookingsPerMonth * 0.8
    ) {
      validation.warnings.push(
        `Warning: ${
          plan.limits.maxBookingsPerMonth -
          customer.usageMetrics.bookingsThisMonth
        } bookings remaining this month`
      );
    }

    return validation;
  } catch (error) {
    console.error('Error validating booking:', error);
    validation.isValid = false;
    validation.errors.push(`Validation error: ${error.message}`);
    return validation;
  }
}

/**
 * Compare plans side by side
 */
export async function comparePlans() {
  try {
    const plans = await PricingPlan.find({ isActive: true }).sort('order');
    const comparison = {
      plans: [],
      features: new Set(),
      limits: new Set(),
    };

    plans.forEach((plan) => {
      comparison.plans.push({
        type: plan.planType,
        name: plan.displayName,
        price: plan.monthlyPrice,
        features: plan.features,
        limits: plan.limits,
        discounts: plan.discounts,
      });
    });

    return comparison;
  } catch (error) {
    console.error('Error comparing plans:', error);
    throw error;
  }
}

/**
 * Get plan upgrade recommendation
 */
export async function getUpgradeRecommendation(phone) {
  try {
    const customer = await getCustomerByPhone(phone);
    if (!customer) {
      return {
        currentPlan: 'FREE',
        recommendation: 'Start with MEMBERSHIP plan',
        reason: 'New customer',
      };
    }

    const currentPlan = await getPricingPlan(customer.planType);
    const allPlans = await PricingPlan.find({ isActive: true }).sort('order');

    // Find next plan tier
    const planOrder = ['FREE', 'MEMBERSHIP'];
    const currentIndex = planOrder.indexOf(customer.planType);

    if (currentIndex >= planOrder.length - 1) {
      return {
        currentPlan: customer.planType,
        recommendation: 'You are on the highest plan',
        reason: 'Already at MEMBERSHIP',
      };
    }

    const nextPlanType = planOrder[currentIndex + 1];
    const nextPlan = await getPricingPlan(nextPlanType);

    // Calculate potential savings
    const monthlyOrderSavings =
      (customer.usageMetrics.ordersThisMonth *
        (nextPlan.discounts.orderDiscount -
          currentPlan.discounts.orderDiscount)) /
      100;

    return {
      currentPlan: customer.planType,
      recommendedPlan: nextPlanType,
      upgradePrice: nextPlan.monthlyPrice - currentPlan.monthlyPrice,
      potentialMonthlySavings: monthlyOrderSavings,
      nextPlanFeatures: nextPlan.features,
    };
  } catch (error) {
    console.error('Error getting upgrade recommendation:', error);
    throw error;
  }
}

/**
 * Create or update customer with plan
 */
export async function createOrUpdateCustomerPlan(customerData) {
  try {
    const { phone, name, planType = 'FREE', address } = customerData;

    if (!phone || !name) {
      throw new Error('Phone and name are required');
    }

    let customer = await Customer.findOne({ phone });

    if (!customer) {
      // Generate customer number
      const customerCount = await Customer.countDocuments();
      const customerNumber = `CUST${String(10000 + customerCount + 1)}`;

      customer = new Customer({
        customerNumber,
        phone,
        name,

        address: address || '',
        planType,
      });
    } else if (planType && planType !== customer.planType) {
      customer.planType = planType;
    }

    // Get plan to set features
    const plan = await getPricingPlan(planType || customer.planType);
    if (plan) {
      customer.planFeatures = plan.features;
      customer.planFeatures.maxOrdersPerMonth = plan.limits.maxOrdersPerMonth;
      customer.planFeatures.maxBookingsPerMonth = plan.limits.maxBookingsPerMonth;
      customer.planFeatures.discountPercentage = plan.discounts.orderDiscount;
    }

    await customer.save();
    return customer;
  } catch (error) {
    console.error('Error creating/updating customer plan:', error);
    throw error;
  }
}

/**
 * Reset monthly usage metrics
 */
export async function resetMonthlyMetrics(phone) {
  try {
    const customer = await getCustomerByPhone(phone);
    if (!customer) {
      throw new Error('Customer not found');
    }

    customer.usageMetrics.ordersThisMonth = 0;
    customer.usageMetrics.bookingsThisMonth = 0;

    await customer.save();
    return customer;
  } catch (error) {
    console.error('Error resetting metrics:', error);
    throw error;
  }
}

/**
 * Update customer usage after order/booking
 */
export async function updateCustomerUsage(phone, type, amount) {
  try {
    const customer = await getCustomerByPhone(phone);
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (type === 'order') {
      customer.usageMetrics.ordersThisMonth += 1;
      customer.usageMetrics.totalOrdersAllTime += 1;
      customer.usageMetrics.totalSpent += amount;
      customer.usageMetrics.averageOrderValue =
        customer.usageMetrics.totalSpent /
        customer.usageMetrics.totalOrdersAllTime;
    } else if (type === 'booking') {
      customer.usageMetrics.bookingsThisMonth += 1;
      customer.usageMetrics.totalBookingsAllTime += 1;
      customer.usageMetrics.totalSpent += amount;
    }

    await customer.save();
    return customer;
  } catch (error) {
    console.error('Error updating customer usage:', error);
    throw error;
  }
}

/**
 * Get customer summary with plan info
 */
export async function getCustomerSummary(phone) {
  try {
    const customer = await getCustomerByPhone(phone);
    if (!customer) {
      return null;
    }

    const plan = await getPricingPlan(customer.planType);

    return {
      customer: {
        customerNumber: customer.customerNumber,
        name: customer.name,
        phone: customer.phone,

        planType: customer.planType,
        planStatus: customer.planStatus,
        loyaltyPoints: customer.loyaltyPoints,
      },
      plan: {
        displayName: plan?.displayName,
        monthlyPrice: plan?.monthlyPrice,
        limits: plan?.limits,
        features: plan?.features,
        discounts: plan?.discounts,
      },
      usage: {
        ordersThisMonth: customer.usageMetrics.ordersThisMonth,
        bookingsThisMonth: customer.usageMetrics.bookingsThisMonth,
        totalOrdersAllTime: customer.usageMetrics.totalOrdersAllTime,
        totalBookingsAllTime: customer.usageMetrics.totalBookingsAllTime,
        totalSpent: customer.usageMetrics.totalSpent,
        averageOrderValue: customer.usageMetrics.averageOrderValue,
      },
    };
  } catch (error) {
    console.error('Error getting customer summary:', error);
    throw error;
  }
}
