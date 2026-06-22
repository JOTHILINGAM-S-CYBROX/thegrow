import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  category: {
    type: String,
    required: true,
    enum: ["Soup", "Appetizer", "Main Course", "Dessert", "Drinks"]
  },

  subCategory: {
    type: String,
    enum: ["Signature", "Indian", "Continental", "Asian"],
  },

  isVeg: {
    type: Boolean,
    default: true
  },

  isSpicy: {
    type: Boolean,
    default: false
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  imageUrl: {
    type: String,
  }

}, { timestamps: true });

export default mongoose.models.Menu || mongoose.model('Menu', MenuSchema);