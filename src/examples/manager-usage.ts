// Example usage of the refactored managers and BusinessManager

import { 
  createCloudBusinessSystem,
  ChallanManager,
  DeliveryManager,
  PaymentManager,
  UserDataStore,
  CloudStorageConfig
} from '../index';

// Example 1: Using individual managers directly
export function individualManagerExample() {
  // Create managers with initial data
  const challanManager = new ChallanManager();
  const deliveryManager = new DeliveryManager();
  const paymentManager = new PaymentManager();

  // Add a challan
  const challan = challanManager.createChallan('cust-001', 'John Doe', [
    {
      itemId: 'item-001',
      quantity: 2,
      dailyRate: 1500.00,
      notes: 'Weekend event'
    }
  ], 'Weekend wedding event');

  console.log('Created challan:', challan.challanNumber);

  // Create delivery for the challan
  const delivery = deliveryManager.createDelivery(
    challan.id,
    challan.customerId,
    '123 Event Street, City, State',
    'Delivery Person',
    [
      {
        itemId: 'item-001',
        quantity: 2,
        condition: 'good',
        notes: 'Handle with care'
      }
    ]
  );

  console.log('Created delivery:', delivery.id);

  // Create payment
  const payment = paymentManager.createPayment(
    challan.id,
    challan.customerId,
    challan.totalAmount,
    'card',
    'TXN123456',
    'Payment for weekend event'
  );

  console.log('Created payment:', payment.id);

  // Get statistics from each manager
  const challanStats = challanManager.getChallanStats();
  const deliveryStats = deliveryManager.getDeliveryStats();
  const paymentStats = paymentManager.getPaymentStats();

  console.log('Challan Stats:', challanStats);
  console.log('Delivery Stats:', deliveryStats);
  console.log('Payment Stats:', paymentStats);

  return { challan, delivery, payment };
}

// Example 2: Using BusinessManager for orchestration
export function businessManagerExample() {
  // Create initial user data
  const initialUserData: UserDataStore = {
    user: {
      id: 'user-001',
      email: 'business@example.com',
      businessName: 'Example Business',
      createdAt: new Date(),
      updatedAt: new Date(),
      billingConfig: {
        currency: 'INR',
        defaultTaxRate: 0.18,
        defaultDiscountRate: 0.00,
        roundingPrecision: 2
      }
    },
    inventory: [],
    customers: [],
    challans: [],
    deliveries: [],
    payments: [],
    billingCalculations: [],
    lastSync: new Date()
  };

  // Create business system
  const businessSystem = createCloudBusinessSystem(initialUserData);

  // Use BusinessManager for orchestrated operations
  const challan = businessSystem.businessManager.createChallan('cust-001', [
    {
      itemId: 'item-001',
      quantity: 1,
      dailyRate: 2000.00,
      notes: 'Corporate event'
    }
  ], 'Corporate event');

  console.log('Created challan via BusinessManager:', challan.challanNumber);

  // Create delivery
  const delivery = businessSystem.businessManager.createDelivery(
    challan.id,
    '456 Corporate Ave, Business District',
    'Corporate Delivery Team'
  );

  console.log('Created delivery via BusinessManager:', delivery.id);

  // Create payment
  const payment = businessSystem.businessManager.createPayment(
    challan.id,
    challan.totalAmount,
    'bank_transfer',
    'BANK789012',
    'Corporate payment'
  );

  console.log('Created payment via BusinessManager:', payment.id);

  // Get comprehensive business statistics
  const stats = businessSystem.businessManager.getBusinessStats();
  console.log('Business Statistics:', stats);

  return { challan, delivery, payment, stats };
}

// Example 3: Direct manager access through BusinessManager
export function directManagerAccessExample() {
  const initialUserData: UserDataStore = {
    user: {
      id: 'user-001',
      email: 'business@example.com',
      businessName: 'Example Business',
      createdAt: new Date(),
      updatedAt: new Date(),
      billingConfig: {
        currency: 'INR',
        defaultTaxRate: 0.18,
        defaultDiscountRate: 0.00,
        roundingPrecision: 2
      }
    },
    inventory: [],
    customers: [],
    challans: [],
    deliveries: [],
    payments: [],
    billingCalculations: [],
    lastSync: new Date()
  };

  const businessSystem = createCloudBusinessSystem(initialUserData);

  // Access individual managers directly
  const challanManager = businessSystem.businessManager.challanManagerInstance;
  const deliveryManager = businessSystem.businessManager.deliveryManagerInstance;
  const paymentManager = businessSystem.businessManager.paymentManagerInstance;

  // Use manager-specific methods
  const challan = challanManager.createChallan('cust-001', 'John Doe', [
    {
      itemId: 'item-001',
      quantity: 3,
      dailyRate: 1000.00,
      notes: 'Multiple items'
    }
  ], 'Multiple items order');

  // Search challans
  const searchResults = challanManager.searchChallans('John Doe');
  console.log('Search results:', searchResults);

  // Get challans by status
  const pendingChallans = challanManager.getChallansByStatus('pending');
  console.log('Pending challans:', pendingChallans);

  // Get delivery statistics
  const deliveryStats = deliveryManager.getDeliveryStats();
  console.log('Delivery statistics:', deliveryStats);

  // Get payment statistics by method
  const paymentMethodStats = paymentManager.getPaymentStatsByMethod();
  console.log('Payment method statistics:', paymentMethodStats);

  return { challan, searchResults, pendingChallans, deliveryStats, paymentMethodStats };
}

// Example 4: Manager synchronization
export function managerSynchronizationExample() {
  const initialUserData: UserDataStore = {
    user: {
      id: 'user-001',
      email: 'business@example.com',
      businessName: 'Example Business',
      createdAt: new Date(),
      updatedAt: new Date(),
      billingConfig: {
        currency: 'INR',
        defaultTaxRate: 0.18,
        defaultDiscountRate: 0.00,
        roundingPrecision: 2
      }
    },
    inventory: [],
    customers: [],
    challans: [],
    deliveries: [],
    payments: [],
    billingCalculations: [],
    lastSync: new Date()
  };

  const businessSystem = createCloudBusinessSystem(initialUserData);

  // Create data using managers
  const challan = businessSystem.businessManager.challanManagerInstance.createChallan(
    'cust-001', 
    'John Doe', 
    [
      {
        itemId: 'item-001',
        quantity: 1,
        dailyRate: 1500.00,
        notes: 'Test item'
      }
    ], 
    'Test order'
  );

  // Sync data store to get updated state
  businessSystem.businessManager.syncDataStore();
  
  // Get updated data store
  const updatedDataStore = businessSystem.businessManager.getDataStore();
  console.log('Updated data store challans:', updatedDataStore.challans);

  // Check manager status
  const managerStatus = businessSystem.businessManager.getManagerStatus();
  console.log('Manager status:', managerStatus);

  // Check if system is initialized
  const isInitialized = businessSystem.businessManager.isInitialized();
  console.log('System initialized:', isInitialized);

  return { challan, updatedDataStore, managerStatus, isInitialized };
}
