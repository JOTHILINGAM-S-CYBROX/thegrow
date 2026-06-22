import dbConnect from '../src/lib/db.js';
import Menu from '../src/models/Menu.js';

const menuData = [
  // Signature Items
  {
    name: "Signature Ghee Podi Idli",
    description: "Crispy idli with aromatic podi masala and pure ghee",
    price: 280,
    category: "Appetizer",
    subCategory: "Signature",
    isVeg: true,
    isSpicy: true,
    imageUrl: "https://source.unsplash.com/400x300/?idli"
  },
  {
    name: "Signature Paneer Butter Masala",
    description: "Tender paneer cubes in silky butter gravy with aromatic spices",
    price: 380,
    category: "Main Course",
    subCategory: "Signature",
    isVeg: true,
    isSpicy: false,
    imageUrl: "https://source.unsplash.com/400x300/?paneer-butter-masala"
  },
  {
    name: "Signature Coconut Biryani",
    description: "Fragrant basmati rice cooked with tender vegetables and coconut essence",
    price: 350,
    category: "Main Course",
    subCategory: "Signature",
    isVeg: true,
    isSpicy: true,
    imageUrl: "https://source.unsplash.com/400x300/?biryani"
  },

  // Continental Items
  {
    name: "Grilled Vegetables with Herbs",
    description: "Seasonal vegetables grilled to perfection with Italian herbs",
    price: 320,
    category: "Appetizer",
    subCategory: "Continental",
    isVeg: true,
    isSpicy: false,
    imageUrl: "https://source.unsplash.com/400x300/?grilled-vegetables"
  },
  {
    name: "Creamy Mushroom Pasta",
    description: "Al dente pasta with creamy mushroom sauce and parmesan",
    price: 360,
    category: "Main Course",
    subCategory: "Continental",
    isVeg: true,
    isSpicy: false,
    imageUrl: "https://source.unsplash.com/400x300/?mushroom-pasta"
  },
  {
    name: "Caesar Salad",
    description: "Crisp lettuce with parmesan, croutons, and classic Caesar dressing",
    price: 280,
    category: "Salad",
    subCategory: "Continental",
    isVeg: true,
    isSpicy: false,
    imageUrl: "https://source.unsplash.com/400x300/?caesar-salad"
  },

  // Asian Items
  {
    name: "Thai Green Curry",
    description: "Aromatic green curry paste with coconut milk and fresh herbs",
    price: 340,
    category: "Main Course",
    subCategory: "Asian",
    isVeg: true,
    isSpicy: true,
    imageUrl: "https://source.unsplash.com/400x300/?thai-curry"
  },
  {
    name: "Asian Stir Fry Noodles",
    description: "Wok-tossed noodles with fresh vegetables and ginger sauce",
    price: 300,
    category: "Main Course",
    subCategory: "Asian",
    isVeg: true,
    isSpicy: true,
    imageUrl: "https://source.unsplash.com/400x300/?stir-fry-noodles"
  },
  {
    name: "Miso Soup",
    description: "Traditional Japanese soup with tofu, seaweed, and miso paste",
    price: 220,
    category: "Soup",
    subCategory: "Asian",
    isVeg: true,
    isSpicy: false,
    imageUrl: "https://source.unsplash.com/400x300/?miso-soup"
  },

  // Drinks
  {
    name: "Cold Coffee",
    description: "Chilled coffee with milk and a hint of vanilla",
    price: 180,
    category: "Drinks",
    subCategory: null,
    isVeg: true,
    isSpicy: false,
    imageUrl: "https://source.unsplash.com/400x300/?cold-coffee"
  },
  {
    name: "Fresh Lemonade",
    description: "Freshly squeezed lemon juice with mint and honey",
    price: 150,
    category: "Drinks",
    subCategory: null,
    isVeg: true,
    isSpicy: false,
    imageUrl: "https://source.unsplash.com/400x300/?lemonade"
  },
  {
    name: "Iced Tea",
    description: "Refreshing iced tea with lemon and mint",
    price: 140,
    category: "Drinks",
    subCategory: null,
    isVeg: true,
    isSpicy: false,
    imageUrl: "https://source.unsplash.com/400x300/?iced-tea"
  },

  // Desserts
  {
    name: "Chocolate Mousse",
    description: "Rich and creamy chocolate mousse with whipped cream",
    price: 240,
    category: "Dessert",
    subCategory: "Continental",
    isVeg: true,
    isSpicy: false,
    imageUrl: "https://source.unsplash.com/400x300/?chocolate-mousse"
  },
  {
    name: "Mango Cheesecake",
    description: "Creamy cheesecake with fresh mango topping",
    price: 280,
    category: "Dessert",
    subCategory: "Continental",
    isVeg: true,
    isSpicy: false,
    imageUrl: "https://source.unsplash.com/400x300/?cheesecake"
  },
  {
    name: "Gulab Jamun",
    description: "Soft milk solids in fragrant sugar syrup",
    price: 160,
    category: "Dessert",
    subCategory: "Signature",
    isVeg: true,
    isSpicy: false,
    imageUrl: "https://source.unsplash.com/400x300/?gulab-jamun"
  },
];

async function seedMenuData() {
  try {
    await dbConnect();
    console.log('🔄 Connected to MongoDB');

    // Delete all existing menu items
    const deleteResult = await Menu.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing menu items`);

    // Insert new menu items
    const insertResult = await Menu.insertMany(menuData);
    console.log(`✅ Inserted ${insertResult.length} new menu items`);

    // Display summary
    console.log('\n📊 Menu Data Summary:');
    const summary = await Menu.aggregate([
      {
        $group: {
          _id: '$subCategory',
          count: { $sum: 1 }
        }
      }
    ]);
    
    summary.forEach(item => {
      const category = item._id || 'No SubCategory';
      console.log(`  ${category}: ${item.count} items`);
    });

    console.log('\n✨ Menu data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding menu data:', error);
    process.exit(1);
  }
}

seedMenuData();
