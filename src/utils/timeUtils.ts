/**
 * Utility functions for handling time calculations in hours.minutes format
 * where 1.30 represents 1 hour and 30 minutes
 */

/**
 * Converts hours.minutes format to total minutes
 * @param hoursMinutes - Time in hours.minutes format (e.g., 1.30 = 1 hour 30 minutes)
 * @returns Total minutes as a number
 */
export const hoursMinutesToMinutes = (hoursMinutes: number): number => {
  const hours = Math.floor(hoursMinutes);
  const minutes = Math.round((hoursMinutes - hours) * 100);
  return (hours * 60) + minutes;
};

/**
 * Converts total minutes to hours.minutes format
 * @param totalMinutes - Total minutes as a number
 * @returns Time in hours.minutes format (e.g., 90 minutes = 1.30)
 */
export const minutesToHoursMinutes = (totalMinutes: number): number => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours + (minutes / 100);
};

/**
 * Sums an array of times in hours.minutes format
 * @param times - Array of times in hours.minutes format
 * @returns Total time in hours.minutes format
 */
export const sumHoursMinutes = (times: number[]): number => {
  const totalMinutes = times.reduce((sum, time) => {
    return sum + hoursMinutesToMinutes(time);
  }, 0);
  
  return minutesToHoursMinutes(totalMinutes);
};

/**
 * Validates that a time value is in correct hours.minutes format
 * @param value - Time value to validate
 * @returns true if valid, error message string if invalid
 */
export const validateTimeFormat = (value: number | undefined): true | string => {
  if (value === undefined) return true;
  const timeStr = value.toString();
  if (timeStr.includes('.')) {
    const [, decimal] = timeStr.split('.');
    const minutes = parseInt(decimal.padEnd(2, '0').substring(0, 2));
    if (minutes > 59) {
      return 'Minutes cannot exceed 59 (use format: hours.minutes)';
    }
  }
  return true;
};

/**
 * Converts a date string to YYYY-MM-DD format for HTML date inputs
 * Handles timezone issues by working with the date components directly
 * @param dateString - Date string to convert
 * @returns Date in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString: string): string => {
  const date = new Date(dateString);
  // Use local date components to avoid timezone shifts
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};