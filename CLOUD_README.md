# Bill-Pro-Max Cloud Storage & Real-Time Updates

This document explains how to use the cloud storage and real-time update features of the Bill-Pro-Max library.

## 🚀 Features

- **MongoDB Cloud Storage** - Store all user data in MongoDB Atlas
- **Real-Time Updates** - WebSocket integration with MongoDB Change Streams
- **Modular Manager Architecture** - Separate managers for challans, deliveries, and payments
- **Business Orchestration** - BusinessManager coordinates between individual managers
- **Automatic Sync** - Seamless cloud synchronization
- **Type Safety** - Full TypeScript support

## 📋 Prerequisites

- MongoDB Atlas account (free tier available)
- Node.js 16+ 
- TypeScript 5.0+

## 🔧 Installation

```bash
npm install bill-pro-max
```

## 📊 Data Structure

Each user gets a single JSON document in MongoDB containing:

```typescript
interface UserDataStore {
  user: User;                    // User info and billing config
  inventory: RentalItem[];       // Rental items
  customers: Customer[];         // Customer list
  challans: Challan[];          // Challan records
  deliveries: Delivery[];        // Delivery records
  payments: Payment[];           // Payment records
  billingCalculations: BillingCalculation[]; // Billing history
  lastSync: Date;               // Last synchronization timestamp
}
```

## 🌐 MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
- Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a free account
- Create a new cluster

### 2. Get Connection String
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string
- Replace `<password>` with your database user password

### 3. Enable Change Streams
- In your cluster, go to "Database Access"
- Create a database user with read/write permissions
- In "Network Access", add your IP address or `0.0.0.0/0` for all IPs

## 🏗️ Manager Architecture

The library now uses a modular approach with separate managers for each business entity:

### **Individual Managers**
- **`ChallanManager`** - Handles all challan operations (create, update, search, statistics)
- **`DeliveryManager`** - Manages delivery tracking and status updates
- **`PaymentManager`** - Handles payment processing and financial tracking
- **`RentalItemManager`** - Manages inventory items and operations
- **`CustomerManager`** - Manages customer data and relationships

### **BusinessManager (Orchestrator)**
- **Orchestrates** operations between different managers
- **Validates** business rules (e.g., customer exists before creating challan)
- **Coordinates** complex workflows (challan → delivery → payment)
- **Provides** unified business statistics
- **Manages** data synchronization

### **Benefits of This Architecture**
- **Separation of Concerns** - Each manager handles its own domain
- **Easier Testing** - Test individual managers in isolation
- **Better Maintainability** - Changes to one manager don't affect others
- **Flexible Usage** - Use managers directly or through BusinessManager
- **Clear Responsibilities** - Each class has a single, well-defined purpose
- **Organized File Structure** - All managers are grouped together in one folder

### **File Organization**
```
src/
├── core/                      # Core business logic
│   ├── BusinessManager.ts     # Orchestrator
│   └── BillingCalculator.ts   # Billing calculations
├── managers/                  # All business entity managers
│   ├── ChallanManager.ts      # Challan operations
│   ├── DeliveryManager.ts     # Delivery operations
│   ├── PaymentManager.ts      # Payment operations
│   ├── RentalItemManager.ts   # Inventory management
│   └── CustomerManager.ts     # Customer management
├── cloud/                     # Cloud storage & WebSocket
│   ├── MongoDBManager.ts      # MongoDB integration
│   └── WebSocketManager.ts    # Real-time updates
└── utils/                     # Utility functions
    ├── dateUtils.ts           # Date operations
    └── mathUtils.ts           # Mathematical operations
```

## 💻 Basic Usage

### 1. Setup Cloud Business System

```typescript
import { createCloudBusinessSystem, UserDataStore, CloudStorageConfig } from 'bill-pro-max';

// MongoDB configuration
const mongoConfig: CloudStorageConfig = {
  connectionString: 'mongodb+srv://username:password@cluster.mongodb.net',
  databaseName: 'billing-app',
  collectionName: 'user-data',
  enableChangeStreams: true // Enable real-time updates
};

// Initial user data
const initialUserData: UserDataStore = {
  user: {
    id: 'user-001',
    email: 'business@example.com',
    businessName: 'My Business',
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

// Create cloud-enabled business system
const businessSystem = createCloudBusinessSystem(initialUserData, mongoConfig);

// Connect to MongoDB
if (businessSystem.mongoManager) {
  await businessSystem.mongoManager.connect();
}
```

### 2. Business Operations

```typescript
// Add inventory
const tentItem = {
  id: 'item-001',
  name: 'Party Tent',
  dailyRate: 1500.00,
  unit: 'piece',
  isActive: true
};

businessSystem.businessManager.addInventoryItem(tentItem);

// Add customer
const customer = {
  id: 'cust-001',
  name: 'John Doe',
  email: 'john@example.com',
  taxExempt: false,
  discountRate: 0.10,
  isActive: true
};

businessSystem.businessManager.addCustomer(customer);

// Create challan
const challan = businessSystem.businessManager.createChallan('cust-001', [
  {
    itemId: 'item-001',
    itemName: 'Party Tent',
    quantity: 1,
    dailyRate: 1500.00
  }
], 'Weekend event');

// Sync to cloud
await businessSystem.syncToCloud('user-001');
```

### 3. Real-Time Updates with WebSocket

```typescript
import { WebSocketManager } from 'bill-pro-max';

// Server-side setup
const wsManager = new WebSocketManager(server, mongoConfig);
await wsManager.connectToMongo();

// Client-side connection
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  // Subscribe to user updates
  ws.send(JSON.stringify({
    type: 'subscribe_user',
    userId: 'user-001'
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'data_update':
      console.log('Real-time update:', message.data);
      // Update your UI here
      break;
  }
};
```

## 🔄 Data Synchronization

### Manual Sync
```typescript
// Save to cloud
await businessSystem.syncToCloud('user-001');

// Load from cloud
await businessSystem.loadFromCloud('user-001');
```

### Automatic Sync with Change Streams
```typescript
// Watch for changes
await businessSystem.mongoManager.watchUserData('user-001', (userData) => {
  console.log('Data updated in real-time:', userData);
  // Update local state
});
```

## 📈 Business Statistics

```typescript
const stats = businessSystem.businessManager.getBusinessStats();

console.log(`Total Challans: ${stats.totalChallans}`);
console.log(`Pending Challans: ${stats.pendingChallans}`);
console.log(`Total Revenue: ₹${stats.totalRevenue.toFixed(2)}`);
console.log(`Active Customers: ${stats.totalCustomers}`);
console.log(`Active Inventory: ${stats.totalInventory}`);
```

## 🏗️ WebSocket Server Integration

### Express.js Server
```typescript
import express from 'express';
import { createServer } from 'http';
import { WebSocketManager } from 'bill-pro-max';

const app = express();
const server = createServer(app);

// Setup WebSocket manager
const wsManager = new WebSocketManager(server, mongoConfig);
await wsManager.connectToMongo();

// Your Express routes here
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', connections: wsManager.getConnectionStats() });
});

server.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

### WebSocket Message Types

```typescript
// Client to Server
{
  type: 'subscribe_user' | 'unsubscribe_user' | 'get_user_data',
  userId: string
}

// Server to Client
{
  type: 'connection_established' | 'subscription_confirmed' | 'data_update' | 'error',
  userId?: string,
  data?: any,
  timestamp: Date
}
```

## 🔒 Security Considerations

1. **Environment Variables**: Store MongoDB connection strings in environment variables
2. **User Authentication**: Implement proper user authentication before allowing WebSocket connections
3. **Data Validation**: Validate all incoming data before processing
4. **Rate Limiting**: Implement rate limiting for WebSocket connections

## 🚨 Error Handling

```typescript
try {
  await businessSystem.syncToCloud('user-001');
} catch (error) {
  if (error.message.includes('Not connected to MongoDB')) {
    // Reconnect to MongoDB
    await businessSystem.mongoManager.connect();
    await businessSystem.syncToCloud('user-001');
  } else {
    console.error('Sync failed:', error);
  }
}
```

## 📝 Environment Variables

```bash
# .env file
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DATABASE=billing-app
MONGODB_COLLECTION=user-data
```

## 🔍 Monitoring & Debugging

```typescript
// Check connection status
console.log('MongoDB connected:', businessSystem.mongoManager.isConnectedToMongo());

// Get WebSocket stats
const stats = wsManager.getConnectionStats();
console.log('Active connections:', stats.totalClients);
console.log('Active change streams:', stats.activeChangeStreams);
```

## 📚 Complete Example

See `src/examples/cloud-usage.ts` for a complete working example.

## 🆘 Troubleshooting

### Common Issues

1. **Change Streams Not Working**
   - Ensure MongoDB Atlas cluster supports change streams (M10+ or free tier)
   - Check database user permissions
   - Verify network access settings

2. **WebSocket Connection Failed**
   - Check if WebSocket server is running
   - Verify WebSocket URL in client
   - Check firewall settings

3. **MongoDB Connection Failed**
   - Verify connection string
   - Check IP whitelist in MongoDB Atlas
   - Ensure database user exists

### Support

For issues and questions:
- Check the examples in `src/examples/`
- Review MongoDB Atlas documentation
- Check WebSocket implementation in your framework

## 🎯 Next Steps

1. Set up MongoDB Atlas cluster
2. Configure your application with the connection string
3. Implement user authentication
4. Test real-time updates
5. Deploy to production

The Bill-Pro-Max library now provides enterprise-grade cloud storage and real-time synchronization capabilities while maintaining the simplicity of the original billing calculator!
