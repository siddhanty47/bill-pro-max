import { Payment, Challan } from '../types';

export class PaymentManager {
  private payments: Payment[] = [];

  constructor(payments?: Payment[]) {
    if (payments) {
      this.payments = [...payments];
    }
  }

  /**
   * Create a new payment
   */
  createPayment(
    challanId: string,
    customerId: string,
    amount: number,
    method: Payment['paymentMethod'],
    referenceNumber?: string,
    notes?: string
  ): Payment {
    const payment: Payment = {
      id: this.generateId(),
      challanId,
      customerId,
      amount,
      paymentDate: new Date(),
      paymentMethod: method,
      referenceNumber,
      status: 'pending',
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.payments.push(payment);
    return payment;
  }

  /**
   * Get a payment by ID
   */
  getPayment(paymentId: string): Payment | undefined {
    return this.payments.find(p => p.id === paymentId);
  }

  /**
   * Get payment by challan ID
   */
  getPaymentByChallan(challanId: string): Payment | undefined {
    return this.payments.find(p => p.challanId === challanId);
  }

  /**
   * Get all payments
   */
  getAllPayments(): Payment[] {
    return [...this.payments];
  }

  /**
   * Get payments by status
   */
  getPaymentsByStatus(status: Payment['status']): Payment[] {
    return this.payments.filter(p => p.status === status);
  }

  /**
   * Get payments by customer
   */
  getPaymentsByCustomer(customerId: string): Payment[] {
    return this.payments.filter(p => p.customerId === customerId);
  }

  /**
   * Get payments by method
   */
  getPaymentsByMethod(method: Payment['paymentMethod']): Payment[] {
    return this.payments.filter(p => p.paymentMethod === method);
  }

  /**
   * Update payment status
   */
  updatePaymentStatus(paymentId: string, status: Payment['status']): boolean {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) {
      return false;
    }

    payment.status = status;
    payment.updatedAt = new Date();
    return true;
  }

  /**
   * Update payment amount
   */
  updatePaymentAmount(paymentId: string, amount: number): boolean {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) {
      return false;
    }

    payment.amount = amount;
    payment.updatedAt = new Date();
    return true;
  }

  /**
   * Update payment method
   */
  updatePaymentMethod(
    paymentId: string, 
    method: Payment['paymentMethod']
  ): boolean {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) {
      return false;
    }

    payment.paymentMethod = method;
    payment.updatedAt = new Date();
    return true;
  }

  /**
   * Add payment notes
   */
  addPaymentNotes(paymentId: string, notes: string): boolean {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) {
      return false;
    }

    payment.notes = notes;
    payment.updatedAt = new Date();
    return true;
  }

  /**
   * Delete payment
   */
  deletePayment(paymentId: string): boolean {
    const index = this.payments.findIndex(p => p.id === paymentId);
    if (index === -1) {
      return false;
    }

    this.payments.splice(index, 1);
    return true;
  }

  /**
   * Get payment statistics
   */
  getPaymentStats() {
    const totalPayments = this.payments.length;
    const pendingPayments = this.payments.filter(p => p.status === 'pending').length;
    const completedPayments = this.payments.filter(p => p.status === 'completed').length;
    const failedPayments = this.payments.filter(p => p.status === 'failed').length;
    const refundedPayments = this.payments.filter(p => p.status === 'refunded').length;
    
    const totalAmount = this.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const pendingAmount = this.payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPayments,
      pendingPayments,
      completedPayments,
      failedPayments,
      refundedPayments,
      totalAmount,
      pendingAmount
    };
  }

  /**
   * Get payment statistics by method
   */
  getPaymentStatsByMethod() {
    const stats: Record<Payment['paymentMethod'], { count: number; amount: number }> = {
      cash: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      bank_transfer: { count: 0, amount: 0 },
      upi: { count: 0, amount: 0 },
      cheque: { count: 0, amount: 0 }
    };

    this.payments
      .filter(p => p.status === 'completed')
      .forEach(payment => {
        stats[payment.paymentMethod].count++;
        stats[payment.paymentMethod].amount += payment.amount;
      });

    return stats;
  }

  /**
   * Search payments
   */
  searchPayments(query: string): Payment[] {
    const lowerQuery = query.toLowerCase();
    return this.payments.filter(payment => 
      payment.referenceNumber?.toLowerCase().includes(lowerQuery) ||
      payment.notes?.toLowerCase().includes(lowerQuery) ||
      payment.paymentMethod.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get payments by date range
   */
  getPaymentsByDateRange(startDate: Date, endDate: Date): Payment[] {
    return this.payments.filter(payment => 
      payment.paymentDate >= startDate && payment.paymentDate <= endDate
    );
  }

  /**
   * Get pending payments
   */
  getPendingPayments(): Payment[] {
    return this.payments.filter(p => p.status === 'pending');
  }

  /**
   * Get completed payments
   */
  getCompletedPayments(): Payment[] {
    return this.payments.filter(p => p.status === 'completed');
  }

  /**
   * Get failed payments
   */
  getFailedPayments(): Payment[] {
    return this.payments.filter(p => p.status === 'failed');
  }

  /**
   * Get total revenue
   */
  getTotalRevenue(): number {
    return this.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  /**
   * Get pending revenue
   */
  getPendingRevenue(): number {
    return this.payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
  }

  // Private utility methods
  private generateId(): string {
    return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current payments array (for BusinessManager to sync)
  getPayments(): Payment[] {
    return this.payments;
  }

  // Set payments (for BusinessManager to sync)
  setPayments(payments: Payment[]): void {
    this.payments = [...payments];
  }
}
