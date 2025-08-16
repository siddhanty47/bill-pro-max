import { Delivery, DeliveryItem, Challan } from '../types';

export class DeliveryManager {
  private deliveries: Delivery[] = [];

  constructor(deliveries?: Delivery[]) {
    if (deliveries) {
      this.deliveries = [...deliveries];
    }
  }

  /**
   * Create a new delivery
   */
  createDelivery(
    challanId: string,
    customerId: string,
    deliveryAddress: string,
    deliveryPerson: string,
    items: Omit<DeliveryItem, 'itemName'>[]
  ): Delivery {
    const delivery: Delivery = {
      id: this.generateId(),
      challanId,
      customerId,
      deliveryDate: new Date(),
      deliveryAddress,
      items: items.map(item => ({
        ...item,
        itemName: `Item ${item.itemId}`
      })),
      deliveryPerson,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.deliveries.push(delivery);
    return delivery;
  }

  /**
   * Get a delivery by ID
   */
  getDelivery(deliveryId: string): Delivery | undefined {
    return this.deliveries.find(d => d.id === deliveryId);
  }

  /**
   * Get delivery by challan ID
   */
  getDeliveryByChallan(challanId: string): Delivery | undefined {
    return this.deliveries.find(d => d.challanId === challanId);
  }

  /**
   * Get all deliveries
   */
  getAllDeliveries(): Delivery[] {
    return [...this.deliveries];
  }

  /**
   * Get deliveries by status
   */
  getDeliveriesByStatus(status: Delivery['status']): Delivery[] {
    return this.deliveries.filter(d => d.status === status);
  }

  /**
   * Get deliveries by customer
   */
  getDeliveriesByCustomer(customerId: string): Delivery[] {
    return this.deliveries.filter(d => d.customerId === customerId);
  }

  /**
   * Update delivery status
   */
  updateDeliveryStatus(deliveryId: string, status: Delivery['status']): boolean {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      return false;
    }

    delivery.status = status;
    delivery.updatedAt = new Date();
    return true;
  }

  /**
   * Update delivery items
   */
  updateDeliveryItems(deliveryId: string, items: DeliveryItem[]): boolean {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      return false;
    }

    delivery.items = items;
    delivery.updatedAt = new Date();
    return true;
  }

  /**
   * Update item condition
   */
  updateItemCondition(
    deliveryId: string, 
    itemId: string, 
    condition: DeliveryItem['condition']
  ): boolean {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      return false;
    }

    const item = delivery.items.find(i => i.itemId === itemId);
    if (!item) {
      return false;
    }

    item.condition = condition;
    delivery.updatedAt = new Date();
    return true;
  }

  /**
   * Add customer signature
   */
  addCustomerSignature(deliveryId: string, signature: string): boolean {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      return false;
    }

    delivery.customerSignature = signature;
    delivery.updatedAt = new Date();
    return true;
  }

  /**
   * Add delivery notes
   */
  addDeliveryNotes(deliveryId: string, notes: string): boolean {
    const delivery = this.deliveries.find(d => d.id === deliveryId);
    if (!delivery) {
      return false;
    }

    delivery.notes = notes;
    delivery.updatedAt = new Date();
    return true;
  }

  /**
   * Delete delivery
   */
  deleteDelivery(deliveryId: string): boolean {
    const index = this.deliveries.findIndex(d => d.id === deliveryId);
    if (index === -1) {
      return false;
    }

    this.deliveries.splice(index, 1);
    return true;
  }

  /**
   * Get delivery statistics
   */
  getDeliveryStats() {
    const totalDeliveries = this.deliveries.length;
    const scheduledDeliveries = this.deliveries.filter(d => d.status === 'scheduled').length;
    const inTransitDeliveries = this.deliveries.filter(d => d.status === 'in-transit').length;
    const deliveredDeliveries = this.deliveries.filter(d => d.status === 'delivered').length;
    const failedDeliveries = this.deliveries.filter(d => d.status === 'failed').length;

    return {
      totalDeliveries,
      scheduledDeliveries,
      inTransitDeliveries,
      deliveredDeliveries,
      failedDeliveries
    };
  }

  /**
   * Search deliveries
   */
  searchDeliveries(query: string): Delivery[] {
    const lowerQuery = query.toLowerCase();
    return this.deliveries.filter(delivery => 
      delivery.deliveryPerson.toLowerCase().includes(lowerQuery) ||
      delivery.deliveryAddress.toLowerCase().includes(lowerQuery) ||
      delivery.notes?.toLowerCase().includes(lowerQuery) ||
      delivery.items.some(item => 
        item.itemName.toLowerCase().includes(lowerQuery)
      )
    );
  }

  /**
   * Get deliveries by date range
   */
  getDeliveriesByDateRange(startDate: Date, endDate: Date): Delivery[] {
    return this.deliveries.filter(delivery => 
      delivery.deliveryDate >= startDate && delivery.deliveryDate <= endDate
    );
  }

  /**
   * Get pending deliveries (scheduled or in-transit)
   */
  getPendingDeliveries(): Delivery[] {
    return this.deliveries.filter(d => 
      d.status === 'scheduled' || d.status === 'in-transit'
    );
  }

  /**
   * Get completed deliveries
   */
  getCompletedDeliveries(): Delivery[] {
    return this.deliveries.filter(d => d.status === 'delivered');
  }

  // Private utility methods
  private generateId(): string {
    return `delivery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current deliveries array (for BusinessManager to sync)
  getDeliveries(): Delivery[] {
    return this.deliveries;
  }

  // Set deliveries (for BusinessManager to sync)
  setDeliveries(deliveries: Delivery[]): void {
    this.deliveries = [...deliveries];
  }
}
