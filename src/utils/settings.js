import dbConnect from '@/lib/db';
import SystemSettings from '@/models/SystemSettings';

export async function getSystemSettings() {
  const defaultSettings = {
    foodOrderingEnabled: true,
    membershipEnabled: true,
    tableBookingEnabled: true,
    eventBookingEnabled: true,
  };

  try {
    await dbConnect();
    let settings = await SystemSettings.findOne({ key: 'system_config' });
    if (!settings) {
      return defaultSettings;
    }
    return settings;
  } catch (error) {
    console.error('Error getting system settings:', error);
    return defaultSettings;
  }
}

export async function isFeatureEnabled(featureName) {
  const settings = await getSystemSettings();
  return settings[featureName] !== false;
}
