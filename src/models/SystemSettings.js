import mongoose from 'mongoose';

const SystemSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'system_config',
  },
  foodOrderingEnabled: {
    type: Boolean,
    default: true,
  },
  membershipEnabled: {
    type: Boolean,
    default: true,
  },
  tableBookingEnabled: {
    type: Boolean,
    default: true,
  },
  eventBookingEnabled: {
    type: Boolean,
    default: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

SystemSettingsSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.SystemSettings || mongoose.model('SystemSettings', SystemSettingsSchema);
