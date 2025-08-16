// Example usage of the billing calculator library

import { 
  createBillingSystem, 
  RentalItem, 
  Customer, 
  RentalOrder, 
  CalculationOptions 
} from '../index';

// Example 1: Basic rental billing calculation
export function basicRentalExample() {
  // Create billing system
  const billingSystem = createBillingSystem({
    currency: 'USD',
    defaultTaxRate: 0.08, // 8% tax
    defaultDiscountRate: 0.05 as number, // 5% default discount
    roundingPrecision: 2
  });

  // Create rental items
  const items: RentalItem[] = [
    {
      id: 'item-001',
      name: 'Party Tent 20x30',
      description: 'Large party tent for outdoor events',
      dailyRate: 150.00,
      unit: 'piece',
      category: 'Tents',
      isActive: true
    },
    {
      id: 'item-002',
      name: 'Folding Chairs',
      description: 'Plastic folding chairs',
      dailyRate: 5.00,
      unit: 'piece',
      category: 'Furniture',
      isActive: true
    }
  ];

  // Add items to manager
  items.forEach(item => billingSystem.itemManager.addItem(item));

  // Create customer
  const customer: Customer = {
    id: 'cust-001',
    name: 'John Doe Events',
    email: 'john@doeevents.com',
    phone: '+1-555-0123',
    address: '123 Event Street, City, State',
    taxExempt: false,
    discountRate: 0.10, // 10% customer discount
    isActive: true
  };

  billingSystem.customerManager.addCustomer(customer);

  // Create rental order
  const order: RentalOrder = {
    id: 'order-001',
    customerId: 'cust-001',
    customerName: 'John Doe Events',
    orderDate: new Date('2024-01-15'),
    deliveryDate: new Date('2024-01-20'),
    returnDate: new Date('2024-01-22'),
    status: 'active',
    items: [
      {
        itemId: 'item-001',
        quantity: 1,
        dailyRate: 150.00,
        totalDays: 3,
        subtotal: 450.00
      },
      {
        itemId: 'item-002',
        quantity: 50,
        dailyRate: 5.00,
        totalDays: 3,
        subtotal: 750.00
      }
    ],
    notes: 'Weekend wedding event'
  };

  // Calculate billing
  const calculationOptions: CalculationOptions = {
    method: 'daily',
    includeTax: true,
    includeDiscount: true,
    roundTo: 2,
    currency: 'USD'
  };

  try {
    const billing = billingSystem.billingCalculator.calculateRentalBilling(
      order, 
      customer, 
      calculationOptions
    );

    console.log('Billing Calculation Result:');
    console.log('Order ID:', billing.orderId);
    console.log('Customer:', billing.customerId);
    console.log('Rental Period:', billing.billingPeriod.totalDays, 'days');
    console.log('Subtotal:', `$${billing.subtotal.toFixed(2)}`);
    console.log('Tax Amount:', `$${billing.taxAmount.toFixed(2)}`);
    console.log('Discount Amount:', `$${billing.discountAmount.toFixed(2)}`);
    console.log('Total Amount:', `$${billing.totalAmount.toFixed(2)}`);
    console.log('Currency:', billing.currency);

    return billing;
  } catch (error) {
    console.error('Error calculating billing:', error);
    throw error;
  }
}

// Example 2: Monthly billing summary
export function monthlyBillingExample() {
  const billingSystem = createBillingSystem();
  
  // This would typically load from a database
  const orders: RentalOrder[] = [
    // ... multiple orders for the month
  ];
  
  const customers: Customer[] = [
    // ... customer data
  ];
  
  const calculationOptions: CalculationOptions = {
    method: 'daily',
    includeTax: true,
    includeDiscount: true,
    roundTo: 2,
    currency: 'USD'
  };
  
  const monthlyBillings = billingSystem.billingCalculator.calculateMonthlyBilling(
    orders,
    customers,
    '2024-01', // January 2024
    calculationOptions
  );
  
  const totalRevenue = monthlyBillings.reduce((sum: number, billing: any) => 
    sum + billing.totalAmount, 0
  );
  
  console.log(`Total Revenue for January 2024: $${totalRevenue.toFixed(2)}`);
  
  return monthlyBillings;
}

// Example 3: Customer revenue analysis
export function customerRevenueExample() {
  const billingSystem = createBillingSystem();
  
  // This would typically load from a database
  const orders: RentalOrder[] = [
    // ... customer orders
  ];
  
  const calculationOptions: CalculationOptions = {
    method: 'daily',
    includeTax: true,
    includeDiscount: true,
    roundTo: 2,
    currency: 'USD'
  };
  
  const customerId = 'cust-001';
  const totalRevenue = billingSystem.customerManager.calculateCustomerRevenue(
    customerId,
    orders,
    calculationOptions
  );
  
  const customerStats = billingSystem.customerManager.getCustomerStats(customerId, orders);
  
  console.log(`Customer ${customerId} Revenue: $${totalRevenue.toFixed(2)}`);
  console.log('Customer Statistics:', customerStats);
  
  return { totalRevenue, customerStats };
}

// Example 4: Item management
export function itemManagementExample() {
  const billingSystem = createBillingSystem();
  
  // Add items
  const newItem: RentalItem = {
    id: 'item-003',
    name: 'Sound System',
    description: 'Professional PA system with speakers',
    dailyRate: 200.00,
    unit: 'set',
    category: 'Audio',
    isActive: true
  };
  
  billingSystem.itemManager.addItem(newItem);
  
  // Search items
  const audioItems = billingSystem.itemManager.getItemsByCategory('Audio');
  const expensiveItems = billingSystem.itemManager.getItemsByPriceRange(100, 500);
  
  console.log('Audio Items:', audioItems);
  console.log('Expensive Items ($100-$500):', expensiveItems);
  
  return { audioItems, expensiveItems };
}

// Example 5: Late fee calculation
export function lateFeeExample() {
  const billingSystem = createBillingSystem();
  
  const order: RentalOrder = {
    id: 'order-002',
    customerId: 'cust-001',
    customerName: 'John Doe Events',
    orderDate: new Date('2024-01-15'),
    deliveryDate: new Date('2024-01-20'),
    returnDate: new Date('2024-01-22'),
    status: 'active',
    items: [
      {
        itemId: 'item-001',
        quantity: 1,
        dailyRate: 150.00,
        totalDays: 3,
        subtotal: 450.00
      }
    ]
  };
  
  const actualReturnDate = new Date('2024-01-25'); // 3 days late
  const lateFees = billingSystem.billingCalculator.calculateLateFees(order, actualReturnDate);
  
  console.log(`Late Fees: $${lateFees.toFixed(2)}`);
  
  return lateFees;
}
