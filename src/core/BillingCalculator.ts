import { 
  RentalOrder, 
  RentalOrderItem, 
  BillingCalculation, 
  BillingItem, 
  BillingPeriod, 
  Customer, 
  TaxConfig, 
  DiscountConfig, 
  BillingConfig, 
  CalculationOptions 
} from '../types';
import { calculateDaysBetween, calculateBillingPeriod } from '../utils/dateUtils';
import { 
  roundTo, 
  calculateTax, 
  calculateDiscount, 
  addWithPrecision 
} from '../utils/mathUtils';

/**
 * Main class for handling billing calculations
 */
export class BillingCalculator {
  private config: BillingConfig;

  constructor(config: BillingConfig) {
    this.config = config;
  }

  /**
   * Calculate billing for a rental order
   * @param order - Rental order
   * @param customer - Customer information
   * @param options - Calculation options
   * @returns BillingCalculation object
   */
  calculateRentalBilling(
    order: RentalOrder, 
    customer: Customer, 
    options: CalculationOptions
  ): BillingCalculation {
    // Calculate billing period
    const billingPeriod = calculateBillingPeriod(order.deliveryDate, order.returnDate);
    
    // Calculate items with daily rates
    const billingItems = this.calculateRentalItems(order.items, billingPeriod.totalDays);
    
    // Calculate subtotal
    const subtotal = this.calculateSubtotal(billingItems);
    
    // Apply customer-specific discount if available
    const customerDiscountRate = customer.discountRate || this.config.defaultDiscountRate;
    const discountAmount = this.calculateDiscountAmount(subtotal, customerDiscountRate);
    
    // Calculate tax (check if customer is tax exempt)
    const taxAmount = customer.taxExempt ? 0 : this.calculateTaxAmount(subtotal, options);
    
    // Calculate total
    const totalAmount = this.calculateTotal(subtotal, taxAmount, discountAmount);
    
    return {
      orderId: order.id,
      customerId: customer.id,
      billingPeriod,
      items: billingItems,
      subtotal: roundTo(subtotal, this.config.roundingPrecision),
      taxRate: options.includeTax ? this.config.defaultTaxRate : 0,
      taxAmount: roundTo(taxAmount, this.config.roundingPrecision),
      discountRate: customerDiscountRate,
      discountAmount: roundTo(discountAmount, this.config.roundingPrecision),
      totalAmount: roundTo(totalAmount, this.config.roundingPrecision),
      currency: this.config.currency,
      calculatedAt: new Date()
    };
  }

  /**
   * Calculate billing items for rental order
   * @param orderItems - Items in the rental order
   * @param totalDays - Total rental days
   * @returns Array of BillingItem objects
   */
  private calculateRentalItems(orderItems: RentalOrderItem[], totalDays: number): BillingItem[] {
    return orderItems.map(item => {
      const subtotal = item.quantity * item.dailyRate * totalDays;
      
      return {
        itemId: item.itemId,
        itemName: `Item ${item.itemId}`, // This would typically come from a catalog
        quantity: item.quantity,
        dailyRate: item.dailyRate,
        totalDays,
        subtotal: roundTo(subtotal, this.config.roundingPrecision)
      };
    });
  }

  /**
   * Calculate subtotal from billing items
   * @param items - Billing items
   * @returns Subtotal amount
   */
  private calculateSubtotal(items: BillingItem[]): number {
    const subtotals = items.map(item => item.subtotal);
    return addWithPrecision(subtotals, this.config.roundingPrecision);
  }

  /**
   * Calculate discount amount
   * @param subtotal - Amount before discount
   * @param discountRate - Discount rate
   * @returns Discount amount
   */
  private calculateDiscountAmount(subtotal: number, discountRate: number): number {
    if (discountRate <= 0) return 0;
    return calculateDiscount(subtotal, discountRate, this.config.roundingPrecision);
  }

  /**
   * Calculate tax amount
   * @param subtotal - Amount before tax
   * @param options - Calculation options
   * @returns Tax amount
   */
  private calculateTaxAmount(subtotal: number, options: CalculationOptions): number {
    if (!options.includeTax) return 0;
    return calculateTax(subtotal, this.config.defaultTaxRate, this.config.roundingPrecision);
  }

  /**
   * Calculate total amount
   * @param subtotal - Amount before tax and discount
   * @param taxAmount - Tax amount
   * @param discountAmount - Discount amount
   * @returns Total amount
   */
  private calculateTotal(subtotal: number, taxAmount: number, discountAmount: number): number {
    return subtotal + taxAmount - discountAmount;
  }

  /**
   * Calculate monthly billing for multiple orders
   * @param orders - Array of rental orders
   * @param customers - Array of customers
   * @param month - Month to calculate for (YYYY-MM format)
   * @param options - Calculation options
   * @returns Array of BillingCalculation objects
   */
  calculateMonthlyBilling(
    orders: RentalOrder[], 
    customers: Customer[], 
    month: string, 
    options: CalculationOptions
  ): BillingCalculation[] {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    
    const monthlyOrders = orders.filter(order => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });

    return monthlyOrders.map(order => {
      const customer = customers.find(c => c.id === order.customerId);
      if (!customer) {
        throw new Error(`Customer not found for order ${order.id}`);
      }
      return this.calculateRentalBilling(order, customer, options);
    });
  }

  /**
   * Calculate late fees for overdue returns
   * @param order - Rental order
   * @param actualReturnDate - Actual return date
   * @returns Late fee amount
   */
  calculateLateFees(order: RentalOrder, actualReturnDate: Date): number {
    if (actualReturnDate <= order.returnDate) return 0;
    
    const overdueDays = calculateDaysBetween(order.returnDate, actualReturnDate);
    const dailyLateFee = this.config.lateFeeRate || 0.05; // Default 5% per day
    
    const subtotal = order.items.reduce((sum, item) => 
      sum + (item.quantity * item.dailyRate), 0
    );
    
    const lateFee = subtotal * dailyLateFee * overdueDays;
    return roundTo(lateFee, this.config.roundingPrecision);
  }

  /**
   * Update billing configuration
   * @param newConfig - New billing configuration
   */
  updateConfig(newConfig: Partial<BillingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current billing configuration
   * @returns Current billing configuration
   */
  getConfig(): BillingConfig {
    return { ...this.config };
  }
}
