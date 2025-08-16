// Core types for the billing system

export interface RentalItem {
  id: string;
  name: string;
  description?: string;
  dailyRate: number;
  unit: string; // e.g., "piece", "meter", "hour"
  category?: string;
  isActive: boolean;
}

export interface RentalOrder {
  id: string;
  customerId: string;
  customerName: string;
  orderDate: Date;
  deliveryDate: Date;
  returnDate: Date;
  items: RentalOrderItem[];
  status: 'pending' | 'active' | 'returned' | 'cancelled';
  notes?: string;
}

export interface RentalOrderItem {
  itemId: string;
  quantity: number;
  dailyRate: number;
  totalDays: number;
  subtotal: number;
}

export interface BillingPeriod {
  startDate: Date;
  endDate: Date;
  totalDays: number;
}

export interface BillingCalculation {
  orderId: string;
  customerId: string;
  billingPeriod: BillingPeriod;
  items: BillingItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  calculatedAt: Date;
}

export interface BillingItem {
  itemId: string;
  itemName: string;
  quantity: number;
  dailyRate: number;
  totalDays: number;
  subtotal: number;
}

export interface TaxConfig {
  rate: number;
  description: string;
  isActive: boolean;
}

export interface DiscountConfig {
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  minimumAmount?: number;
  isActive: boolean;
}

export interface BillingConfig {
  currency: string;
  defaultTaxRate: number;
  defaultDiscountRate: number;
  roundingPrecision: number;
  lateFeeRate?: number;
  gracePeriodDays?: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxExempt: boolean;
  discountRate?: number;
  isActive: boolean;
}

// New interfaces for cloud storage and additional business entities

export interface User {
  id: string;
  email: string;
  businessName: string;
  businessAddress?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  billingConfig: BillingConfig;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customerName: string;
  challanDate: Date;
  items: ChallanItem[];
  totalAmount: number;
  status: 'pending' | 'delivered' | 'returned' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallanItem {
  itemId: string;
  itemName: string;
  quantity: number;
  dailyRate: number;
  notes?: string;
}

export interface Delivery {
  id: string;
  challanId: string;
  customerId: string;
  deliveryDate: Date;
  deliveryAddress: string;
  items: DeliveryItem[];
  deliveryPerson: string;
  customerSignature?: string;
  status: 'scheduled' | 'in-transit' | 'delivered' | 'failed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryItem {
  itemId: string;
  itemName: string;
  quantity: number;
  condition: 'good' | 'fair' | 'poor';
  notes?: string;
}

export interface Payment {
  id: string;
  challanId: string;
  customerId: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'upi' | 'cheque';
  referenceNumber?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDataStore {
  user: User;
  inventory: RentalItem[];
  customers: Customer[];
  challans: Challan[];
  deliveries: Delivery[];
  payments: Payment[];
  billingCalculations: BillingCalculation[];
  lastSync: Date;
}

// Utility types
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export type CalculationMethod = 'daily' | 'hourly' | 'weekly' | 'monthly';

export interface CalculationOptions {
  method: CalculationMethod;
  includeTax: boolean;
  includeDiscount: boolean;
  roundTo: number;
  currency: Currency;
}

// Cloud storage interfaces
export interface CloudStorageConfig {
  connectionString: string;
  databaseName: string;
  collectionName: string;
  enableChangeStreams?: boolean;
}

export interface SyncResult {
  success: boolean;
  message: string;
  lastSync: Date;
  recordsUpdated: number;
}

export interface CloudStorageManager {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  saveUserData(userId: string, data: UserDataStore): Promise<SyncResult>;
  loadUserData(userId: string): Promise<UserDataStore | null>;
  deleteUserData(userId: string): Promise<boolean>;
  updateUserData(userId: string, updates: Partial<UserDataStore>): Promise<SyncResult>;
  watchUserData(userId: string, callback: (data: UserDataStore) => void): Promise<void>;
  stopWatching(userId: string): Promise<void>;
}

// WebSocket interfaces for real-time updates
export interface WebSocketMessage {
  type: 'data_update' | 'sync_complete' | 'error';
  userId: string;
  data?: any;
  timestamp: Date;
}

export interface ChangeStreamEvent {
  operationType: 'insert' | 'update' | 'replace' | 'delete';
  documentKey: { _id: string };
  fullDocument?: any;
  updateDescription?: any;
}
