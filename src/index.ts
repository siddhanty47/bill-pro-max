// Main export file for the billing calculator library

// Import classes for internal use
import { BillingCalculator } from './core/BillingCalculator';
import { RentalItemManager } from './managers/RentalItemManager';
import { CustomerManager } from './managers/CustomerManager';
import { BusinessManager } from './core/BusinessManager';
import { MongoDBManager } from './cloud/MongoDBManager';
import { WebSocketManager } from './cloud/WebSocketManager';

// Core classes
export { BillingCalculator } from './core/BillingCalculator';
export { BusinessManager } from './core/BusinessManager';

// Business entity managers
export { RentalItemManager } from './managers/RentalItemManager';
export { CustomerManager } from './managers/CustomerManager';
export { ChallanManager } from './managers/ChallanManager';
export { DeliveryManager } from './managers/DeliveryManager';
export { PaymentManager } from './managers/PaymentManager';

// Cloud storage classes
export { MongoDBManager } from './cloud/MongoDBManager';
export { WebSocketManager } from './cloud/WebSocketManager';

// Types
export * from './types';

// Utility functions
export * from './utils/dateUtils';
export * from './utils/mathUtils';

// Default configuration
export const DEFAULT_BILLING_CONFIG = {
  currency: 'USD',
  defaultTaxRate: 0.08, // 8%
  defaultDiscountRate: 0.00, // 0%
  roundingPrecision: 2,
  lateFeeRate: 0.05, // 5% per day
  gracePeriodDays: 3
};

// Factory function to create a billing calculator with default config
export function createBillingCalculator(config?: Partial<typeof DEFAULT_BILLING_CONFIG>) {
  const finalConfig = { ...DEFAULT_BILLING_CONFIG, ...config };
  return new BillingCalculator(finalConfig);
}

// Factory function to create a complete billing system
export function createBillingSystem(config?: Partial<typeof DEFAULT_BILLING_CONFIG>) {
  const billingCalculator = createBillingCalculator(config);
  const itemManager = new RentalItemManager();
  const customerManager = new CustomerManager(billingCalculator);
  
  return {
    billingCalculator,
    itemManager,
    customerManager
  };
}

// Factory function to create a cloud-enabled business system
export function createCloudBusinessSystem(
  userData: any, 
  mongoConfig?: any
) {
  const businessManager = new BusinessManager(userData);
  
  let mongoManager: MongoDBManager | null = null;
  if (mongoConfig) {
    mongoManager = new MongoDBManager(mongoConfig);
  }
  
  return {
    businessManager,
    mongoManager,
    // Helper method to sync with cloud
    async syncToCloud(userId: string) {
      if (mongoManager) {
        const dataStore = businessManager.getDataStore();
        return await mongoManager.saveUserData(userId, dataStore);
      }
      throw new Error('MongoDB manager not configured');
    },
    // Helper method to load from cloud
    async loadFromCloud(userId: string) {
      if (mongoManager) {
        const dataStore = await mongoManager.loadUserData(userId);
        if (dataStore) {
          // Update the business manager with cloud data
          Object.assign(businessManager, { dataStore });
        }
        return dataStore;
      }
      throw new Error('MongoDB manager not configured');
    }
  };
}
