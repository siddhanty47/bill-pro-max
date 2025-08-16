// Utility functions for date calculations
import { BillingPeriod } from '../types';

/**
 * Calculate the number of days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days (inclusive)
 */
export function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Reset time to start of day for accurate day calculation
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const timeDiff = end.getTime() - start.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return Math.max(1, daysDiff); // Minimum 1 day
}

/**
 * Calculate billing period from delivery and return dates
 * @param deliveryDate - Date when items were delivered
 * @param returnDate - Date when items were returned
 * @returns BillingPeriod object
 */
export function calculateBillingPeriod(deliveryDate: Date, returnDate: Date): BillingPeriod {
  const startDate = new Date(deliveryDate);
  const endDate = new Date(returnDate);
  const totalDays = calculateDaysBetween(startDate, endDate);
  
  return {
    startDate,
    endDate,
    totalDays
  };
}

/**
 * Check if a date is within a billing period
 * @param date - Date to check
 * @param period - Billing period
 * @returns True if date is within the period
 */
export function isDateInPeriod(date: Date, period: BillingPeriod): boolean {
  const checkDate = new Date(date);
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  
  return checkDate >= start && checkDate <= end;
}

/**
 * Get the current date as a Date object
 * @returns Current date
 */
export function getCurrentDate(): Date {
  return new Date();
}

/**
 * Format date to YYYY-MM-DD string
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse date string to Date object
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Add days to a date
 * @param date - Starting date
 * @param days - Number of days to add
 * @returns New date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if a date is a weekend
 * @param date - Date to check
 * @returns True if date is weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Calculate business days between two dates (excluding weekends)
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of business days
 */
export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let businessDays = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (!isWeekend(current)) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return businessDays;
}
