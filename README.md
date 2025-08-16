# Billing Calculator Library

A comprehensive TypeScript library for handling billing calculations in rental businesses and other billing scenarios. This library provides robust, type-safe billing calculations with support for rental items, customers, tax calculations, discounts, and late fees.

## Features

- **Rental Billing Calculations**: Calculate daily, weekly, or monthly rental costs
- **Tax & Discount Support**: Flexible tax and discount calculations with customer-specific rules
- **Customer Management**: Manage customer information, tax exemptions, and discount rates
- **Item Management**: Handle rental items with categories, daily rates, and availability
- **Late Fee Calculations**: Automatic late fee calculations for overdue returns
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Extensible**: Easy to extend for different billing scenarios
- **React Ready**: Designed to work seamlessly with React applications

## Installation

```bash
npm install billing-calculator
```

## Quick Start

```typescript
import { createBillingSystem, RentalItem, Customer, RentalOrder } from 'billing-calculator';

// Create a billing system
const billingSystem = createBillingSystem({
  currency: 'USD',
  defaultTaxRate: 0.08, // 8% tax
  defaultDiscountRate: 0.05, // 5% default discount
  roundingPrecision: 2
});

// Add rental items
const tent: RentalItem = {
  id: 'tent-001',
  name: 'Party Tent',
  dailyRate: 150.00,
  unit: 'piece',
  isActive: true
};

billingSystem.itemManager.addItem(tent);

// Add customer
const customer: Customer = {
  id: 'cust-001',
  name: 'John Doe Events',
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
  orderDate: new Date(),
  deliveryDate: new Date('2024-01-20'),
  returnDate: new Date('2024-01-22'),
  status: 'active',
  items: [{
    itemId: 'tent-001',
    quantity: 1,
    dailyRate: 150.00,
    totalDays: 3,
    subtotal: 450.00
  }]
};

// Calculate billing
const billing = billingSystem.billingCalculator.calculateRentalBilling(
  order,
  customer,
  {
    method: 'daily',
    includeTax: true,
    includeDiscount: true,
    roundTo: 2,
    currency: 'USD'
  }
);

console.log(`Total Amount: $${billing.totalAmount}`);
```

## Core Classes

### BillingCalculator

The main class for handling billing calculations:

```typescript
import { BillingCalculator } from 'billing-calculator';

const calculator = new BillingCalculator({
  currency: 'USD',
  defaultTaxRate: 0.08,
  defaultDiscountRate: 0.00,
  roundingPrecision: 2
});

// Calculate rental billing
const billing = calculator.calculateRentalBilling(order, customer, options);

// Calculate monthly billing
const monthlyBillings = calculator.calculateMonthlyBilling(orders, customers, '2024-01', options);

// Calculate late fees
const lateFees = calculator.calculateLateFees(order, actualReturnDate);
```

### RentalItemManager

Manages rental items and their operations:

```typescript
import { RentalItemManager } from 'billing-calculator';

const itemManager = new RentalItemManager();

// Add items
itemManager.addItem(tent);

// Search items
const audioItems = itemManager.getItemsByCategory('Audio');
const expensiveItems = itemManager.getItemsByPriceRange(100, 500);

// Update rates
itemManager.updateDailyRate('tent-001', 175.00);
```

### CustomerManager

Handles customer operations and customer-specific billing rules:

```typescript
import { CustomerManager } from 'billing-calculator';

const customerManager = new CustomerManager(billingCalculator);

// Add customers
customerManager.addCustomer(customer);

// Update customer settings
customerManager.updateDiscountRate('cust-001', 0.15);
customerManager.setTaxExemption('cust-001', true);

// Get customer statistics
const stats = customerManager.getCustomerStats('cust-001', orders);
```

## Configuration

The library supports various configuration options:

```typescript
const config = {
  currency: 'USD',                    // Currency code
  defaultTaxRate: 0.08,              // Default tax rate (8%)
  defaultDiscountRate: 0.05,         // Default discount rate (5%)
  roundingPrecision: 2,              // Decimal places for rounding
  lateFeeRate: 0.05,                 // Daily late fee rate (5%)
  gracePeriodDays: 3                 // Grace period before late fees
};
```

## Advanced Usage

### Custom Tax Calculations

```typescript
// Create custom tax configuration
const customTax: TaxConfig = {
  rate: 0.095, // 9.5% tax
  description: 'State Sales Tax',
  isActive: true
};

// Update calculator configuration
calculator.updateConfig({ defaultTaxRate: customTax.rate });
```

### Business Day Calculations

```typescript
import { calculateBusinessDays } from 'billing-calculator';

// Calculate business days (excluding weekends)
const businessDays = calculateBusinessDays(startDate, endDate);
```

### Export/Import Data

```typescript
// Export items to JSON
const itemsJSON = itemManager.exportToJSON();

// Import items from JSON
const success = itemManager.importFromJSON(itemsJSON);
```

## React Integration

The library works seamlessly with React applications. For a complete React demo application, see the separate `bill-pro-max-webapp` repository.

```typescript
import React, { useState, useEffect } from 'react';
import { createBillingSystem } from 'billing-calculator';

function BillingCalculator() {
  const [billingSystem] = useState(() => createBillingSystem());
  const [billing, setBilling] = useState(null);

  const calculateBilling = (order, customer) => {
    const result = billingSystem.billingCalculator.calculateRentalBilling(
      order,
      customer,
      calculationOptions
    );
    setBilling(result);
  };

  return (
    <div>
      {/* Your React components here */}
      {billing && (
        <div>
          <h3>Billing Summary</h3>
          <p>Total: ${billing.totalAmount}</p>
        </div>
      )}
    </div>
  );
}
```

### React Demo App

A complete React demo application is available in the separate `bill-pro-max-webapp` repository, which demonstrates:
- Interactive billing calculations
- Item and customer management
- Real-time updates and responsive design
- Complete integration examples

## TypeScript Support

The library is built with TypeScript and provides comprehensive type definitions:

```typescript
import { 
  RentalItem, 
  Customer, 
  RentalOrder, 
  BillingCalculation,
  CalculationOptions 
} from 'billing-calculator';

// All types are fully typed and documented
const item: RentalItem = {
  id: 'item-001',
  name: 'Tent',
  dailyRate: 150.00,
  unit: 'piece',
  isActive: true
};
```

## Testing

Run the test suite:

```bash
npm test
```

## Building

Build the library:

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Database integration support
- [ ] Multi-currency support
- [ ] Advanced discount rules
- [ ] Invoice generation
- [ ] Payment processing integration
- [ ] Reporting and analytics
- [ ] Webhook support
- [ ] API rate limiting
