/**
 * Database Initialization Module
 * Automatically creates all collections, schemas, and indexes on startup
 * No manual data files needed - production ready
 */

import Order from '@/models/Order';
import Customer from '@/models/Customer';
import Menu from '@/models/Menu';
import WhatsAppAuth from '@/models/WhatsAppAuth';
import PricingPlan from '@/models/PricingPlan';
import VenueBooking from '@/models/VenueBooking';
import SystemSettings from '@/models/SystemSettings';

/**
 * Initialize all database collections and indexes
 * This runs automatically on first connection
 */
export async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database collections and indexes...');

    // Force collection creation by accessing each model
    const models = [
      { name: 'Order', model: Order },
      { name: 'Customer', model: Customer },
      { name: 'Menu', model: Menu },
      { name: 'WhatsAppAuth', model: WhatsAppAuth },
      { name: 'PricingPlan', model: PricingPlan },
      { name: 'VenueBooking', model: VenueBooking },
      { name: 'SystemSettings', model: SystemSettings },
    ];

    // Create collections and indexes
    for (const { name, model } of models) {
      try {
        // Ensure collection exists
        await model.collection.createIndex({ _id: 1 });

        // Ensure all indexes from schema are created
        await model.collection.createIndexes();

        // Get collection info
        const stats = await model.collection.stats();
        console.log(`  ✅ ${name}: Collection initialized (${stats.count} documents)`);
      } catch (error) {
        // Collection might already exist - this is fine
        const docCount = await model.countDocuments();
        console.log(`  ✅ ${name}: Collection exists (${docCount} documents)`);
      }
    }

    // Initialize default pricing plans if empty
    const planCount = await PricingPlan.countDocuments();
    if (planCount === 0) {
      console.log('📦 Creating default pricing plans...');

      const defaultPlans = [
        {
          planType: 'FREE',
          displayName: 'Free Plan',
          description: 'Basic access to the system for trying out features',
          monthlyPrice: 0,
          limits: {
            maxOrdersPerMonth: 0,
            maxBookingsPerMonth: 0,
            maxOrderValue: 0,
          },
          features: [
            'Basic ordering',
            'Email support',
            'Limited to 5 orders/month',
          ],
          discounts: {
            discountPercentage: 0,
            maxDiscountAmount: 0,
          },
          isActive: true,
        },
        {
          planType: 'BASIC',
          displayName: 'Basic Plan',
          description: 'Standard features for regular users with discounts',
          monthlyPrice: 299,
          limits: {
            maxOrdersPerMonth: 0,
            maxBookingsPerMonth: 0,
            maxOrderValue: 0,
          },
          features: [
            'Priority ordering',
            'Email & phone support',
            'Up to 20 orders/month',
            '10% discount on orders',
            'Booking reservations',
          ],
          discounts: {
            discountPercentage: 10,
            maxDiscountAmount: 10000,
          },
          isActive: true,
        },
        {
          planType: 'PREMIUM',
          displayName: 'Premium Plan',
          description: 'Ultimate access with priority support and big discounts',
          monthlyPrice: 999,
          limits: {
            maxOrdersPerMonth: 999999,
            maxBookingsPerMonth: 999999,
            maxOrderValue: 999999,
          },
          features: [
            'Unlimited ordering',
            '24/7 dedicated support',
            'Unlimited bookings',
            '20% discount on orders',
            'Priority queue',
            'Special event planning',
            'Loyalty rewards',
          ],
          discounts: {
            discountPercentage: 20,
            maxDiscountAmount: 999999,
          },
          isActive: true,
        },
      ];

      await PricingPlan.insertMany(defaultPlans);
      console.log('  ✅ Default pricing plans created (3 plans)');
    } else {
      console.log(`  ✅ Pricing plans already exist (${planCount} plans)`);
    }

    // Initialize default menu items if empty
    const menuCount = await Menu.countDocuments();
    if (menuCount === 0) {
      console.log('📦 Creating default menu items...');

      const defaultMenuItems = [
        {
          name: 'Biryani',
          price: 250,
          description: 'Fragrant basmati rice with spices and meat',
          category: 'Main Course',
          isVeg: false,
          isSpicy: true,
          imageUrl: '/assets/ambience/03.jpg.webp',
          available: true,
        },
        {
          name: 'Samosa',
          price: 30,
          description: 'Crispy pastry with spiced potato filling',
          category: 'Appetizer',
          isVeg: true,
          isSpicy: true,
          imageUrl: '/assets/ambience/09.jpg.webp',
          available: true,
        },
        {
          name: 'Chai',
          price: 30,
          description: 'Traditional Indian tea',
          category: 'Drinks',
          isVeg: true,
          isSpicy: false,
          imageUrl: '/assets/ambience/07.jpg.webp',
          available: true,
        },
        {
          name: 'Paneer Tikka',
          price: 280,
          description: 'Marinated cottage cheese grilled to perfection',
          category: 'Appetizer',
          isVeg: true,
          isSpicy: true,
          imageUrl: '/assets/ambience/11.jpg.webp',
          available: true,
        },
        {
          name: 'Butter Chicken',
          price: 320,
          description: 'Tender chicken in creamy tomato sauce',
          category: 'Main Course',
          isVeg: false,
          isSpicy: false,
          imageUrl: '/assets/ambience/11.jpg.webp',
          available: true,
        },
      ];

      await Menu.insertMany(defaultMenuItems);
      console.log(`  ✅ Default menu items created (${defaultMenuItems.length} items)`);
    } else {
      console.log(`  ✅ Menu items already exist (${menuCount} items)`);
      // Update existing menu items by name to use correct local image paths
      await Menu.updateMany({ name: 'Biryani' }, { imageUrl: '/assets/ambience/03.jpg.webp' });
      await Menu.updateMany({ name: 'Samosa' }, { imageUrl: '/assets/ambience/09.jpg.webp' });
      await Menu.updateMany({ name: 'Chai' }, { imageUrl: '/assets/ambience/07.jpg.webp' });
      await Menu.updateMany({ name: 'Paneer Tikka' }, { imageUrl: '/assets/ambience/11.jpg.webp' });
      await Menu.updateMany({ name: 'Butter Chicken' }, { imageUrl: '/assets/ambience/11.jpg.webp' });
      console.log('  ✅ Existing menu item image paths updated to correct local assets.');
    }

    // Initialize default system config if empty
    const settingsCount = await SystemSettings.countDocuments({ key: 'system_config' });
    if (settingsCount === 0) {
      console.log('📦 Creating default system settings...');
      await SystemSettings.create({
        key: 'system_config',
        foodOrderingEnabled: true,
        membershipEnabled: true,
        tableBookingEnabled: true,
        eventBookingEnabled: true,
      });
      console.log('  ✅ Default system settings created');
    } else {
      console.log('  ✅ System settings already exist');
    }

    console.log('✅ Database initialization complete!\n');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

export default initializeDatabase;
