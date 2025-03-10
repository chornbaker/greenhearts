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
  userDisplayName?: string;
  archived?: boolean; // Whether the plant is archived
  archivedAt?: Date; // When the plant was archived
  archivedReason?: string; // Reason for archiving (e.g., "Died", "Given away", etc.)
  recognitionData?: PlantRecognitionData; // New field for plant recognition data
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

// Plant Recognition types
export interface PlantRecognitionData {
  recognizedSpecies: string;
  scientificName?: string; // Scientific name of the recognized species
  confidence: number;
  description?: string; // Brief description of the plant
  alternativeSpecies?: AlternativeSpecies[];
  recognizedAt: Date;
  imageUrl?: string;
  distinctiveFeatures?: string[]; // Distinctive features of the plant
}

export interface AlternativeSpecies {
  name: string;
  scientificName?: string;
  confidence: number;
}

export interface PlantRecognitionResult {
  success: boolean;
  data?: PlantRecognitionData;
  error?: string;
}

export interface PlantCareGuide {
  species: string;
  scientificName?: string;
  commonNames?: string[];
  description?: string;
  careInstructions: CareInstructions;
  wateringSchedule: {
    frequency: number;
    description: string;
  };
  seasonalCare?: SeasonalCare;
  tips?: string[];
}

export interface SeasonalCare {
  spring?: string;
  summer?: string;
  fall?: string;
  winter?: string;
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
  Recognition = 'recognition', // New notification type for plant recognition
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 