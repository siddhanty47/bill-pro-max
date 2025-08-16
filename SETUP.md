# Billing Calculator Library - Setup Guide

This guide will help you set up and run the billing calculator library.

## Project Structure

```
bill-pro-max/
├── src/                          # Main library source code
│   ├── core/                     # Core billing classes
│   │   ├── BillingCalculator.ts  # Main billing calculation logic
│   │   ├── RentalItemManager.ts  # Rental item management
│   │   └── CustomerManager.ts    # Customer management
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts             # All interfaces and types
│   ├── utils/                    # Utility functions
│   │   ├── dateUtils.ts         # Date calculation utilities
│   │   └── mathUtils.ts         # Mathematical calculation utilities
│   ├── examples/                 # Usage examples
│   │   └── usage.ts             # Example code snippets
│   ├── __tests__/                # Test files
│   │   ├── setup.ts             # Test configuration
│   │   └── BillingCalculator.test.ts
│   └── index.ts                  # Main library exports
├── package.json                 # Library dependencies
├── tsconfig.json               # TypeScript configuration
├── jest.config.js              # Jest test configuration
├── .eslintrc.js                # ESLint configuration
├── .gitignore                  # Git ignore rules
├── README.md                   # Library documentation
└── SETUP.md                    # This setup guide
```

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- Git

## Installation Steps

### 1. Install Library Dependencies

```bash
# Navigate to the project root
cd bill-pro-max

# Install dependencies
npm install
```

### 2. Build the Library

```bash
# Build the TypeScript library
npm run build

# Or watch for changes during development
npm run dev
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test -- --coverage

# Run tests in watch mode
npm run test -- --watch
```

### 4. Lint the Code

```bash
# Check for linting issues
npm run lint
```

## Library Usage

### Basic Setup

```typescript
import { createBillingSystem, RentalItem, Customer } from 'billing-calculator';

// Create a billing system with default configuration
const billingSystem = createBillingSystem();

// Or with custom configuration
const billingSystem = createBillingSystem({
  currency: 'EUR',
  defaultTaxRate: 0.20, // 20% VAT
  defaultDiscountRate: 0.10, // 10% default discount
  roundingPrecision: 2
});
```

### Adding Rental Items

```typescript
const tent: RentalItem = {
  id: 'tent-001',
  name: 'Party Tent 20x30',
  description: 'Large party tent for outdoor events',
  dailyRate: 150.00,
  unit: 'piece',
  category: 'Tents',
  isActive: true
};

billingSystem.itemManager.addItem(tent);
```

### Adding Customers

```typescript
const customer: Customer = {
  id: 'cust-001',
  name: 'John Doe Events',
  email: 'john@doeevents.com',
  phone: '+1-555-0123',
  address: '123 Event Street, City, State',
  taxExempt: false,
  discountRate: 0.15, // 15% customer discount
  isActive: true
};

billingSystem.customerManager.addCustomer(customer);
```

### Calculating Billing

```typescript
import { RentalOrder, CalculationOptions } from 'billing-calculator';

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

const calculationOptions: CalculationOptions = {
  method: 'daily',
  includeTax: true,
  includeDiscount: true,
  roundTo: 2,
  currency: 'USD'
};

const billing = billingSystem.billingCalculator.calculateRentalBilling(
  order,
  customer,
  calculationOptions
);

console.log(`Total Amount: $${billing.totalAmount}`);
```

## Development Workflow

### 1. Library Development

```bash
# Make changes to library code
# Run tests to ensure nothing breaks
npm test

# Build the library
npm run build

# Check for linting issues
npm run lint
```

## Configuration Options

### Billing Configuration

```typescript
interface BillingConfig {
  currency: string;                    // Currency code (USD, EUR, etc.)
  defaultTaxRate: number;              // Default tax rate (0.08 = 8%)
  defaultDiscountRate: number;         // Default discount rate (0.05 = 5%)
  roundingPrecision: number;           // Decimal places for rounding
  lateFeeRate?: number;                // Daily late fee rate
  gracePeriodDays?: number;            // Grace period before late fees
}
```

### Calculation Options

```typescript
interface CalculationOptions {
  method: 'daily' | 'hourly' | 'weekly' | 'monthly';
  includeTax: boolean;
  includeDiscount: boolean;
  roundTo: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';
}
```

## Troubleshooting

### Common Issues

1. **TypeScript Compilation Errors**
   - Ensure all dependencies are installed: `npm install`
   - Check TypeScript version compatibility
   - Verify `tsconfig.json` configuration

2. **Test Failures**
   - Check Jest configuration in `jest.config.js`
   - Ensure test setup file is properly configured
   - Verify test environment setup

3. **Build Issues**
   - Clean build directory: `npm run clean`
   - Rebuild: `npm run build`
   - Check for syntax errors in source files

### Getting Help

- Check the `README.md` for detailed documentation
- Review example code in `src/examples/usage.ts`
- Run tests to identify specific issues
- Check console errors in browser developer tools

## Next Steps

After setting up the library and demo app:

1. **Explore the Code**: Review the source code to understand the architecture
2. **Run Examples**: Try the example functions in the usage file
3. **Modify Configuration**: Adjust billing settings for your use case
4. **Extend Functionality**: Add new features or modify existing ones
5. **Integrate**: Use the library in your own projects
6. **Contribute**: Submit improvements or bug fixes

## Support

For additional support:
- Review the comprehensive `README.md`
- Check the example code and tests
- Examine the TypeScript type definitions

Happy coding! 🚀
