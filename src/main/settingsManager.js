import Store from 'electron-store';

// Define schema with types and defaults
const schema = {
  format: {
    type: 'string',
    default: 'jpg',
    enum: ['jpg', 'png', 'webp', 'avif', 'tiff']
  },
  quality: {
    type: 'number',
    default: 80,
    minimum: 0,
    maximum: 100
  },
  width: {
    type: ['number', 'null'],
    default: null
  },
  height: {
    type: ['number', 'null'],
    default: null
  },
  preserveMetadata: {
    type: 'boolean',
    default: true
  },
  outputFolder: {
    type: ['string', 'null'],
    default: null
  }
};

// Initialize store with schema
const store = new Store({
  schema,
  name: 'conversion-settings',
  // Stored in: C:\Users\{username}\AppData\Roaming\Image Converter\conversion-settings.json
});

/**
 * Retrieves all conversion settings
 * @returns {Object} Settings object with all conversion preferences
 */
export function getSettings() {
  return {
    format: store.get('format'),
    quality: store.get('quality'),
    width: store.get('width'),
    height: store.get('height'),
    preserveMetadata: store.get('preserveMetadata'),
    outputFolder: store.get('outputFolder')
  };
}

/**
 * Saves conversion settings
 * @param {Object} settings - Settings object to save
 */
export function saveSettings(settings) {
  try {
    // Validate and save each setting
    Object.keys(settings).forEach(key => {
      if (settings[key] !== undefined && schema[key]) {
        // Schema validation happens automatically
        store.set(key, settings[key]);
      }
    });
    console.log('Settings saved successfully:', settings);
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

/**
 * Resets all settings to defaults
 */
export function resetSettings() {
  store.clear();
  console.log('Settings reset to defaults');
}

/**
 * Gets the settings file path (for debugging)
 */
export function getSettingsPath() {
  return store.path;
}
