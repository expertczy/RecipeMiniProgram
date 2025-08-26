// Example Configuration file for Recipe Mini Program
// Copy this file to config.js and update with your actual values

export const config = {
  // API Configuration
  API_ENDPOINT: 'https://your-api-gateway-url.execute-api.region.amazonaws.com',
  
  // App Configuration
  APP_NAME: 'Recipe Mini Program',
  APP_VERSION: '1.0.0',
  
  // Feature Flags
  ENABLE_LOGGING: true,
  ENABLE_DEBUG: false,
  
  // UI Configuration
  DEFAULT_PAGE_SIZE: 20,
  ANIMATION_DURATION: 300,
  
  // Image Configuration
  IMAGE_QUALITY: 0.8,
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Cache Configuration
  CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
}

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  // You can add environment detection logic here
  // For now, we'll use the default config
  return config;
}

export default config;
