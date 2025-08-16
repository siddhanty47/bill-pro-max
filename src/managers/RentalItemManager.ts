import { RentalItem } from '../types';
import { roundTo } from '../utils/mathUtils';

/**
 * Manages rental items and their operations
 */
export class RentalItemManager {
  private items: Map<string, RentalItem> = new Map();

  constructor(items?: RentalItem[]) {
    if (items) {
      items.forEach(item => this.addItem(item));
    }
  }

  /**
   * Add a new rental item
   * @param item - Rental item to add
   * @returns True if added successfully
   */
  addItem(item: RentalItem): boolean {
    if (this.items.has(item.id)) {
      return false; // Item already exists
    }
    
    this.items.set(item.id, { ...item });
    return true;
  }

  /**
   * Get a rental item by ID
   * @param id - Item ID
   * @returns Rental item or undefined if not found
   */
  getItem(id: string): RentalItem | undefined {
    return this.items.get(id);
  }

  /**
   * Get all rental items
   * @param activeOnly - Return only active items
   * @returns Array of rental items
   */
  getAllItems(activeOnly: boolean = true): RentalItem[] {
    const items = Array.from(this.items.values());
    return activeOnly ? items.filter(item => item.isActive) : items;
  }

  /**
   * Update an existing rental item
   * @param id - Item ID
   * @param updates - Partial updates to apply
   * @returns True if updated successfully
   */
  updateItem(id: string, updates: Partial<RentalItem>): boolean {
    const item = this.items.get(id);
    if (!item) {
      return false;
    }

    const updatedItem = { ...item, ...updates };
    this.items.set(id, updatedItem);
    return true;
  }

  /**
   * Delete a rental item
   * @param id - Item ID
   * @returns True if deleted successfully
   */
  deleteItem(id: string): boolean {
    return this.items.delete(id);
  }

  /**
   * Deactivate a rental item (soft delete)
   * @param id - Item ID
   * @returns True if deactivated successfully
   */
  deactivateItem(id: string): boolean {
    return this.updateItem(id, { isActive: false });
  }

  /**
   * Activate a rental item
   * @param id - Item ID
   * @returns True if activated successfully
   */
  activateItem(id: string): boolean {
    return this.updateItem(id, { isActive: true });
  }

  /**
   * Update daily rate for an item
   * @param id - Item ID
   * @param newRate - New daily rate
   * @returns True if updated successfully
   */
  updateDailyRate(id: string, newRate: number): boolean {
    if (newRate < 0) {
      return false;
    }
    return this.updateItem(id, { dailyRate: newRate });
  }

  /**
   * Get items by category
   * @param category - Category to filter by
   * @param activeOnly - Return only active items
   * @returns Array of rental items in the category
   */
  getItemsByCategory(category: string, activeOnly: boolean = true): RentalItem[] {
    const items = this.getAllItems(activeOnly);
    return items.filter(item => item.category === category);
  }

  /**
   * Search items by name or description
   * @param query - Search query
   * @param activeOnly - Return only active items
   * @returns Array of matching rental items
   */
  searchItems(query: string, activeOnly: boolean = true): RentalItem[] {
    const items = this.getAllItems(activeOnly);
    const lowerQuery = query.toLowerCase();
    
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      (item.description && item.description.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get items within a price range
   * @param minRate - Minimum daily rate
   * @param maxRate - Maximum daily rate
   * @param activeOnly - Return only active items
   * @returns Array of rental items within the price range
   */
  getItemsByPriceRange(minRate: number, maxRate: number, activeOnly: boolean = true): RentalItem[] {
    const items = this.getAllItems(activeOnly);
    return items.filter(item => 
      item.dailyRate >= minRate && item.dailyRate <= maxRate
    );
  }

  /**
   * Calculate total value of all items
   * @param activeOnly - Calculate only for active items
   * @returns Total value
   */
  getTotalInventoryValue(activeOnly: boolean = true): number {
    const items = this.getAllItems(activeOnly);
    const total = items.reduce((sum, item) => sum + item.dailyRate, 0);
    return roundTo(total, 2);
  }

  /**
   * Get item count by category
   * @param activeOnly - Count only active items
   * @returns Map of category to item count
   */
  getItemCountByCategory(activeOnly: boolean = true): Map<string, number> {
    const items = this.getAllItems(activeOnly);
    const categoryCount = new Map<string, number>();
    
    items.forEach(item => {
      const category = item.category || 'Uncategorized';
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });
    
    return categoryCount;
  }

  /**
   * Export items to JSON
   * @returns JSON string of all items
   */
  exportToJSON(): string {
    const items = Array.from(this.items.values());
    return JSON.stringify(items, null, 2);
  }

  /**
   * Import items from JSON
   * @param jsonString - JSON string containing items
   * @returns True if imported successfully
   */
  importFromJSON(jsonString: string): boolean {
    try {
      const items: RentalItem[] = JSON.parse(jsonString);
      items.forEach(item => this.addItem(item));
      return true;
    } catch (error) {
      return false;
    }
  }
}
