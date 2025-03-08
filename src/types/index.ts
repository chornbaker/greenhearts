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
  image?: string; // URL to the plant image in Firebase Storage
  location?: string; // Room or space where the plant is located
  wateringSchedule: WateringSchedule;
  notes?: string;
  health?: PlantHealth;
  createdAt: Date;
  lastWatered?: Date;
  nextWateringDate?: Date;
  personalityType?: string; // Plant personality type
  bio?: string; // Plant bio/description
  careInstructions?: CareInstructions; // New field for care instructions
}

export interface WateringSchedule {
  frequency: number; // in days
  lastWatered?: Date;
  nextWateringDate?: Date;
  description?: string; // Human-readable description of watering needs
}

export interface CareInstructions {
  light?: string; // Light requirements description
  soil?: string; // Soil requirements description
  temperature?: string; // Temperature requirements description
  humidity?: string; // Humidity requirements description
  fertilizer?: string; // Fertilizer recommendations
  pruning?: string; // Pruning recommendations
  repotting?: string; // Repotting recommendations
  commonIssues?: string; // Common issues and how to address them
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