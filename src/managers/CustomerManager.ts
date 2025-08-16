import { Customer, RentalOrder, BillingCalculation } from '../types';
import { BillingCalculator } from '../core/BillingCalculator';

/**
 * Manages customers and their operations
 */
export class CustomerManager {
  private customers: Map<string, Customer> = new Map();
  private billingCalculator: BillingCalculator;

  constructor(billingCalculator: BillingCalculator, customers?: Customer[]) {
    this.billingCalculator = billingCalculator;
    if (customers) {
      customers.forEach(customer => this.addCustomer(customer));
    }
  }

  /**
   * Add a new customer
   * @param customer - Customer to add
   * @returns True if added successfully
   */
  addCustomer(customer: Customer): boolean {
    if (this.customers.has(customer.id)) {
      return false; // Customer already exists
    }
    
    this.customers.set(customer.id, { ...customer });
    return true;
  }

  /**
   * Get a customer by ID
   * @param id - Customer ID
   * @returns Customer or undefined if not found
   */
  getCustomer(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  /**
   * Get all customers
   * @param activeOnly - Return only active customers
   * @returns Array of customers
   */
  getAllCustomers(activeOnly: boolean = true): Customer[] {
    const customers = Array.from(this.customers.values());
    return activeOnly ? customers.filter(customer => customer.isActive) : customers;
  }

  /**
   * Update an existing customer
   * @param id - Customer ID
   * @param updates - Partial updates to apply
   * @returns True if updated successfully
   */
  updateCustomer(id: string, updates: Partial<Customer>): boolean {
    const customer = this.customers.get(id);
    if (!customer) {
      return false;
    }

    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return true;
  }

  /**
   * Delete a customer
   * @param id - Customer ID
   * @returns True if deleted successfully
   */
  deleteCustomer(id: string): boolean {
    return this.customers.delete(id);
  }

  /**
   * Deactivate a customer (soft delete)
   * @param id - Customer ID
   * @returns True if deactivated successfully
   */
  deactivateCustomer(id: string): boolean {
    return this.updateCustomer(id, { isActive: false });
  }

  /**
   * Activate a customer
   * @param id - Customer ID
   * @returns True if activated successfully
   */
  activateCustomer(id: string): boolean {
    return this.updateCustomer(id, { isActive: true });
  }

  /**
   * Update customer discount rate
   * @param id - Customer ID
   * @param discountRate - New discount rate
   * @returns True if updated successfully
   */
  updateDiscountRate(id: string, discountRate: number): boolean {
    if (discountRate < 0 || discountRate > 1) {
      return false; // Invalid discount rate
    }
    return this.updateCustomer(id, { discountRate });
  }

  /**
   * Set customer tax exemption status
   * @param id - Customer ID
   * @param taxExempt - Tax exemption status
   * @returns True if updated successfully
   */
  setTaxExemption(id: string, taxExempt: boolean): boolean {
    return this.updateCustomer(id, { taxExempt });
  }

  /**
   * Search customers by name, email, or phone
   * @param query - Search query
   * @param activeOnly - Return only active customers
   * @returns Array of matching customers
   */
  searchCustomers(query: string, activeOnly: boolean = true): Customer[] {
    const customers = this.getAllCustomers(activeOnly);
    const lowerQuery = query.toLowerCase();
    
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(lowerQuery) ||
      (customer.email && customer.email.toLowerCase().includes(lowerQuery)) ||
      (customer.phone && customer.phone.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get customers by tax exemption status
   * @param taxExempt - Tax exemption status to filter by
   * @param activeOnly - Return only active customers
   * @returns Array of customers with specified tax exemption status
   */
  getCustomersByTaxStatus(taxExempt: boolean, activeOnly: boolean = true): Customer[] {
    const customers = this.getAllCustomers(activeOnly);
    return customers.filter(customer => customer.taxExempt === taxExempt);
  }

  /**
   * Get customers with discount rates
   * @param activeOnly - Return only active customers
   * @returns Array of customers with discount rates
   */
  getCustomersWithDiscounts(activeOnly: boolean = true): Customer[] {
    const customers = this.getAllCustomers(activeOnly);
    return customers.filter(customer => customer.discountRate && customer.discountRate > 0);
  }

  /**
   * Calculate total revenue from a customer
   * @param customerId - Customer ID
   * @param orders - Array of rental orders
   * @param calculationOptions - Billing calculation options
   * @returns Total revenue amount
   */
  calculateCustomerRevenue(
    customerId: string, 
    orders: RentalOrder[], 
    calculationOptions: any
  ): number {
    const customer = this.getCustomer(customerId);
    if (!customer) {
      return 0;
    }

    const customerOrders = orders.filter(order => order.customerId === customerId);
    let totalRevenue = 0;

    customerOrders.forEach(order => {
      try {
        const billing = this.billingCalculator.calculateRentalBilling(
          order, 
          customer, 
          calculationOptions
        );
        totalRevenue += billing.totalAmount;
      } catch (error) {
        console.error(`Error calculating billing for order ${order.id}:`, error);
      }
    });

    return totalRevenue;
  }

  /**
   * Get customer statistics
   * @param customerId - Customer ID
   * @param orders - Array of rental orders
   * @returns Customer statistics object
   */
  getCustomerStats(customerId: string, orders: RentalOrder[]): {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
  } {
    const customerOrders = orders.filter(order => order.customerId === customerId);
    const totalOrders = customerOrders.length;
    
    if (totalOrders === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
      };
    }

    const totalRevenue = customerOrders.reduce((sum, order) => {
      const subtotal = order.items.reduce((itemSum, item) => 
        itemSum + (item.quantity * item.dailyRate * item.totalDays), 0
      );
      return sum + subtotal;
    }, 0);

    const averageOrderValue = totalRevenue / totalOrders;
    const lastOrderDate = customerOrders
      .map(order => new Date(order.orderDate))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      lastOrderDate
    };
  }

  /**
   * Export customers to JSON
   * @returns JSON string of all customers
   */
  exportToJSON(): string {
    const customers = Array.from(this.customers.values());
    return JSON.stringify(customers, null, 2);
  }

  /**
   * Import customers from JSON
   * @param jsonString - JSON string containing customers
   * @returns True if imported successfully
   */
  importFromJSON(jsonString: string): boolean {
    try {
      const customers: Customer[] = JSON.parse(jsonString);
      customers.forEach(customer => this.addCustomer(customer));
      return true;
    } catch (error) {
      return false;
    }
  }
}
