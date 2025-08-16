import { Challan, ChallanItem, Customer } from '../types';

export class ChallanManager {
  private challans: Challan[] = [];

  constructor(challans?: Challan[]) {
    if (challans) {
      this.challans = [...challans];
    }
  }

  /**
   * Create a new challan
   */
  createChallan(
    customerId: string, 
    customerName: string,
    items: Omit<ChallanItem, 'itemName'>[], 
    notes?: string
  ): Challan {
    const challan: Challan = {
      id: this.generateId(),
      challanNumber: this.generateChallanNumber(),
      customerId,
      customerName,
      challanDate: new Date(),
      items: items.map(item => ({
        ...item,
        itemName: `Item ${item.itemId}`
      })),
      totalAmount: this.calculateChallanTotal(items),
      status: 'pending',
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.challans.push(challan);
    return challan;
  }

  /**
   * Get a challan by ID
   */
  getChallan(challanId: string): Challan | undefined {
    return this.challans.find(c => c.id === challanId);
  }

  /**
   * Get all challans
   */
  getAllChallans(): Challan[] {
    return [...this.challans];
  }

  /**
   * Get challans by status
   */
  getChallansByStatus(status: Challan['status']): Challan[] {
    return this.challans.filter(c => c.status === status);
  }

  /**
   * Get challans by customer
   */
  getChallansByCustomer(customerId: string): Challan[] {
    return this.challans.filter(c => c.customerId === customerId);
  }

  /**
   * Update challan status
   */
  updateChallanStatus(challanId: string, status: Challan['status']): boolean {
    const challan = this.challans.find(c => c.id === challanId);
    if (!challan) {
      return false;
    }

    challan.status = status;
    challan.updatedAt = new Date();
    return true;
  }

  /**
   * Update challan items
   */
  updateChallanItems(challanId: string, items: ChallanItem[]): boolean {
    const challan = this.challans.find(c => c.id === challanId);
    if (!challan) {
      return false;
    }

    challan.items = items;
    challan.totalAmount = this.calculateChallanTotal(items);
    challan.updatedAt = new Date();
    return true;
  }

  /**
   * Add notes to challan
   */
  addChallanNotes(challanId: string, notes: string): boolean {
    const challan = this.challans.find(c => c.id === challanId);
    if (!challan) {
      return false;
    }

    challan.notes = notes;
    challan.updatedAt = new Date();
    return true;
  }

  /**
   * Delete challan
   */
  deleteChallan(challanId: string): boolean {
    const index = this.challans.findIndex(c => c.id === challanId);
    if (index === -1) {
      return false;
    }

    this.challans.splice(index, 1);
    return true;
  }

  /**
   * Get challan statistics
   */
  getChallanStats() {
    const totalChallans = this.challans.length;
    const pendingChallans = this.challans.filter(c => c.status === 'pending').length;
    const deliveredChallans = this.challans.filter(c => c.status === 'delivered').length;
    const returnedChallans = this.challans.filter(c => c.status === 'returned').length;
    const cancelledChallans = this.challans.filter(c => c.status === 'cancelled').length;
    const totalAmount = this.challans.reduce((sum, c) => sum + c.totalAmount, 0);

    return {
      totalChallans,
      pendingChallans,
      deliveredChallans,
      returnedChallans,
      cancelledChallans,
      totalAmount
    };
  }

  /**
   * Search challans
   */
  searchChallans(query: string): Challan[] {
    const lowerQuery = query.toLowerCase();
    return this.challans.filter(challan => 
      challan.challanNumber.toLowerCase().includes(lowerQuery) ||
      challan.customerName.toLowerCase().includes(lowerQuery) ||
      challan.notes?.toLowerCase().includes(lowerQuery) ||
      challan.items.some(item => 
        item.itemName.toLowerCase().includes(lowerQuery)
      )
    );
  }

  /**
   * Get challans by date range
   */
  getChallansByDateRange(startDate: Date, endDate: Date): Challan[] {
    return this.challans.filter(challan => 
      challan.challanDate >= startDate && challan.challanDate <= endDate
    );
  }

  // Private utility methods
  private generateId(): string {
    return `challan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChallanNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const count = this.challans.length + 1;
    return `CH-${year}${month}-${count.toString().padStart(4, '0')}`;
  }

  private calculateChallanTotal(items: Omit<ChallanItem, 'itemName'>[]): number {
    return items.reduce((total, item) => total + (item.quantity * item.dailyRate), 0);
  }

  // Get current challans array (for BusinessManager to sync)
  getChallans(): Challan[] {
    return this.challans;
  }

  // Set challans (for BusinessManager to sync)
  setChallans(challans: Challan[]): void {
    this.challans = [...challans];
  }
}
