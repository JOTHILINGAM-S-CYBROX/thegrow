import mongoose from 'mongoose';
import pkg from '@next/env';
const { loadEnvConfig } = pkg;
import path from 'path';

// Load environment variables
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const MONGODB_URI = process.env.MONGODB_URI;

const MenuSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  menuType: { type: String, enum: ["FOOD", "BAR"], default: "FOOD" },
  subCategory: { type: String },
  isVeg: { type: Boolean, default: true },
  isSpicy: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  imageUrl: { type: String }
}, { timestamps: true });

const Menu = mongoose.models.Menu || mongoose.model('Menu', MenuSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Update existing items
    const result = await Menu.updateMany(
      { menuType: { $exists: false } },
      { $set: { menuType: 'FOOD' } }
    );
    console.log(`Updated ${result.modifiedCount} existing menu items to FOOD`);

    // 2. Add some dummy Bar items if they don't exist
    const barItems = [
      {
        name: 'Grove Special IPA',
        price: 450,
        description: 'Crafted locally, this IPA brings hints of citrus and pine.',
        category: 'Drinks',
        subCategory: 'Beer',
        menuType: 'BAR',
        isVeg: true,
        isSpicy: false,
        isAvailable: true,
      },
      {
        name: 'Classic Mojito',
        price: 350,
        description: 'Refreshing white rum with mint and lime.',
        category: 'Drinks',
        subCategory: 'Cocktails',
        menuType: 'BAR',
        isVeg: true,
        isSpicy: false,
        isAvailable: true,
      },
      {
        name: 'Whiskey Sour',
        price: 550,
        description: 'Premium bourbon, fresh lemon juice, and a dash of egg white.',
        category: 'Drinks',
        subCategory: 'Cocktails',
        menuType: 'BAR',
        isVeg: false,
        isSpicy: false,
        isAvailable: true,
      },
      {
        name: 'House Merlot',
        price: 1200,
        description: 'A smooth, full-bodied red wine with notes of dark cherry.',
        category: 'Drinks',
        subCategory: 'Wine',
        menuType: 'BAR',
        isVeg: true,
        isSpicy: false,
        isAvailable: true,
      }
    ];

    for (const item of barItems) {
      const exists = await Menu.findOne({ name: item.name });
      if (!exists) {
        await Menu.create(item);
        console.log(`Created Bar Item: ${item.name}`);
      }
    }

    console.log('✅ Menu fix complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
