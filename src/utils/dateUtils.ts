import { Plant } from '@/types';

/**
 * Calculates the number of days a plant is overdue for watering.
 * Returns 0 if the plant is due today or in the future.
 */
export const getDaysOverdue = (plant: Plant): number => {
  if (!plant.nextWateringDate) return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWatering = new Date(plant.nextWateringDate);
  nextWatering.setHours(0, 0, 0, 0);
  
  // If due today or in future, not overdue
  if (nextWatering.getTime() >= today.getTime()) {
    return 0;
  }
  
  // Calculate difference in days
  const diffTime = today.getTime() - nextWatering.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Checks if a plant is due for watering today
 */
export const isDueToday = (plant: Plant): boolean => {
  if (!plant.nextWateringDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWatering = new Date(plant.nextWateringDate);
  nextWatering.setHours(0, 0, 0, 0);
  
  return nextWatering.getTime() === today.getTime();
};

/**
 * Gets the watering status text for a plant
 */
export const getWateringStatusText = (plant: Plant): string => {
  if (!plant.nextWateringDate) return 'No watering schedule';
  
  if (isDueToday(plant)) return 'Water today';
  
  const daysOverdue = getDaysOverdue(plant);
  if (daysOverdue > 0) {
    return daysOverdue === 1 ? '1 day overdue' : `${daysOverdue} days overdue`;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWatering = new Date(plant.nextWateringDate);
  nextWatering.setHours(0, 0, 0, 0);
  
  const diffTime = nextWatering.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return daysUntil === 1 ? 'Water tomorrow' : `${daysUntil} days to water`;
}; 