// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  plants: Plant[];
}

// Plant types
export interface Plant {
  id: string;
  userId: string;
  name: string;
  species?: string;
  image?: string;
  wateringSchedule: WateringSchedule;
  notes?: string;
  health?: PlantHealth;
  createdAt: Date;
  lastWatered?: Date;
  nextWateringDate?: Date;
}

export interface WateringSchedule {
  frequency: number; // in days
  lastWatered?: Date;
  nextWateringDate?: Date;
}

export enum PlantHealth {
  Excellent = 'excellent',
  Good = 'good',
  Fair = 'fair',
  Poor = 'poor',
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  plantId?: string;
  message: string;
  read: boolean;
  createdAt: Date;
  type: NotificationType;
}

export enum NotificationType {
  Watering = 'watering',
  Health = 'health',
  System = 'system',
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 