import { 
  UserDataStore, 
  RentalItem, 
  Customer,
  BillingCalculation,
  CalculationOptions
} from '../types';
import { BillingCalculator } from './BillingCalculator';
import { RentalItemManager } from '../managers/RentalItemManager';
import { CustomerManager } from '../managers/CustomerManager';
import { ChallanManager } from '../managers/ChallanManager';
import { DeliveryManager } from '../managers/DeliveryManager';
import { PaymentManager } from '../managers/PaymentManager';

export class BusinessManager {
  private dataStore: UserDataStore;
  private billingCalculator: BillingCalculator;
  private itemManager: RentalItemManager;
  private customerManager: CustomerManager;
  private challanManager: ChallanManager;
  private deliveryManager: DeliveryManager;
  private paymentManager: PaymentManager;

  constructor(dataStore: UserDataStore) {
    this.dataStore = dataStore;
    this.billingCalculator = new BillingCalculator(dataStore.user.billingConfig);
    this.itemManager = new RentalItemManager(dataStore.inventory);
    this.customerManager = new CustomerManager(this.billingCalculator, dataStore.customers);
    this.challanManager = new ChallanManager(dataStore.challans);
    this.deliveryManager = new DeliveryManager(dataStore.deliveries);
    this.paymentManager = new PaymentManager(dataStore.payments);
  }

  // ===== MANAGER ACCESSORS =====
  
  // Get individual managers for direct access
  get challanManagerInstance() { return this.challanManager; }
  get deliveryManagerInstance() { return this.deliveryManager; }
  get paymentManagerInstance() { return this.paymentManager; }
  get itemManagerInstance() { return this.itemManager; }
  get customerManagerInstance() { return this.customerManager; }
  get billingCalculatorInstance() { return this.billingCalculator; }

  // ===== ORCHESTRATION METHODS =====

  // Create challan with customer validation
  createChallan(customerId: string, items: any[], notes?: string) {
    const customer = this.customerManager.getCustomer(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    return this.challanManager.createChallan(customerId, customer.name, items, notes);
  }

  // Create delivery from challan
  createDelivery(challanId: string, deliveryAddress: string, deliveryPerson: string) {
    const challan = this.challanManager.getChallan(challanId);
    if (!challan) {
      throw new Error('Challan not found');
    }

    const items = challan.items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
      condition: 'good' as const,
      notes: ''
    }));

    return this.deliveryManager.createDelivery(
      challanId, 
      challan.customerId, 
      deliveryAddress, 
      deliveryPerson, 
      items
    );
  }

  // Create payment for challan
  createPayment(challanId: string, amount: number, method: any, referenceNumber?: string, notes?: string) {
    const challan = this.challanManager.getChallan(challanId);
    if (!challan) {
      throw new Error('Challan not found');
    }

    return this.paymentManager.createPayment(
      challanId, 
      challan.customerId, 
      amount, 
      method, 
      referenceNumber, 
      notes
    );
  }

  // Calculate billing for challan
  calculateChallanBilling(challanId: string, options: CalculationOptions): BillingCalculation | null {
    const challan = this.challanManager.getChallan(challanId);
    if (!challan) {
      return null;
    }

    const customer = this.customerManager.getCustomer(challan.customerId);
    if (!customer) {
      return null;
    }

    // Convert challan to rental order format for billing calculation
    const rentalOrder = {
      id: challan.id,
      customerId: challan.customerId,
      customerName: challan.customerName,
      orderDate: challan.challanDate,
      deliveryDate: challan.challanDate,
      returnDate: new Date(challan.challanDate.getTime() + 24 * 60 * 60 * 1000), // 1 day later
      items: challan.items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        dailyRate: item.dailyRate,
        totalDays: 1,
        subtotal: item.quantity * item.dailyRate
      })),
      status: 'active' as const,
      notes: challan.notes
    };

    try {
      const billing = this.billingCalculator.calculateRentalBilling(rentalOrder, customer, options);
      this.dataStore.billingCalculations.push(billing);
      return billing;
    } catch (error) {
      console.error('Error calculating billing:', error);
      return null;
    }
  }

  // ===== DATA SYNCHRONIZATION =====

  // Sync data from managers back to data store
  syncDataStore(): void {
    this.dataStore.inventory = this.itemManager.getAllItems();
    this.dataStore.customers = this.customerManager.getAllCustomers();
    this.dataStore.challans = this.challanManager.getChallans();
    this.dataStore.deliveries = this.deliveryManager.getDeliveries();
    this.dataStore.payments = this.paymentManager.getPayments();
    this.dataStore.lastSync = new Date();
  }

  // Get updated data store
  getDataStore(): UserDataStore {
    this.syncDataStore();
    return { ...this.dataStore };
  }

  // ===== BUSINESS STATISTICS =====

  // Get comprehensive business statistics
  getBusinessStats() {
    const challanStats = this.challanManager.getChallanStats();
    const deliveryStats = this.deliveryManager.getDeliveryStats();
    const paymentStats = this.paymentManager.getPaymentStats();
    const totalCustomers = this.customerManager.getAllCustomers().filter(c => c.isActive).length;
    const totalInventory = this.itemManager.getAllItems().filter(i => i.isActive).length;

    return {
      // Challan statistics
      totalChallans: challanStats.totalChallans,
      pendingChallans: challanStats.pendingChallans,
      deliveredChallans: challanStats.deliveredChallans,
      returnedChallans: challanStats.returnedChallans,
      cancelledChallans: challanStats.cancelledChallans,
      challanTotalAmount: challanStats.totalAmount,

      // Delivery statistics
      totalDeliveries: deliveryStats.totalDeliveries,
      pendingDeliveries: deliveryStats.scheduledDeliveries + deliveryStats.inTransitDeliveries,
      deliveredDeliveries: deliveryStats.deliveredDeliveries,
      failedDeliveries: deliveryStats.failedDeliveries,

      // Payment statistics
      totalPayments: paymentStats.totalPayments,
      pendingPayments: paymentStats.pendingPayments,
      completedPayments: paymentStats.completedPayments,
      failedPayments: paymentStats.failedPayments,
      totalRevenue: paymentStats.totalAmount,
      pendingRevenue: paymentStats.pendingAmount,

      // Business overview
      totalCustomers,
      totalInventory
    };
  }

  // ===== UTILITY METHODS =====

  // Check if all managers are properly initialized
  isInitialized(): boolean {
    return !!(
      this.challanManager &&
      this.deliveryManager &&
      this.paymentManager &&
      this.itemManager &&
      this.customerManager &&
      this.billingCalculator
    );
  }

  // Get manager status
  getManagerStatus() {
    return {
      challanManager: !!this.challanManager,
      deliveryManager: !!this.deliveryManager,
      paymentManager: !!this.paymentManager,
      itemManager: !!this.itemManager,
      customerManager: !!this.customerManager,
      billingCalculator: !!this.billingCalculator
    };
  }
}
