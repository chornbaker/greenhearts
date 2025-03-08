'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Plant } from '@/types';
import { generateWaterReminderMessage } from '@/services/claude';

type WaterReminderMessages = {
  [plantId: string]: {
    message: string;
    generatedDate: Date;
  };
};

type WaterReminderContextType = {
  messages: WaterReminderMessages;
  getOrGenerateMessage: (plant: Plant) => Promise<string>;
  clearMessages: () => void;
};

const WaterReminderContext = createContext<WaterReminderContextType | undefined>(undefined);

export function WaterReminderProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<WaterReminderMessages>({});
  
  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('waterReminderMessages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        
        // Convert string dates back to Date objects
        const messagesWithDates: WaterReminderMessages = {};
        Object.keys(parsed).forEach(key => {
          messagesWithDates[key] = {
            ...parsed[key],
            generatedDate: new Date(parsed[key].generatedDate)
          };
        });
        
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Error loading water reminder messages:', error);
    }
  }, []);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('waterReminderMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving water reminder messages:', error);
    }
  }, [messages]);
  
  // Calculate days overdue for a plant
  const calculateDaysOverdue = (plant: Plant): number => {
    if (!plant.nextWateringDate) return 0;
    
    const today = new Date();
    const nextWatering = new Date(plant.nextWateringDate);
    
    // If not overdue, return 0
    if (nextWatering > today) return 0;
    
    const diffTime = Math.abs(today.getTime() - nextWatering.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  // Check if we need to generate a new message (if it's a new day)
  const shouldGenerateNewMessage = (plantId: string): boolean => {
    const existingMessage = messages[plantId];
    if (!existingMessage) return true;
    
    const today = new Date();
    const generatedDate = new Date(existingMessage.generatedDate);
    
    return today.toDateString() !== generatedDate.toDateString();
  };
  
  // Get or generate a message for a plant
  const getOrGenerateMessage = async (plant: Plant): Promise<string> => {
    // If we already have a message for today, return it
    if (messages[plant.id] && !shouldGenerateNewMessage(plant.id)) {
      return messages[plant.id].message;
    }
    
    // Calculate days overdue
    const daysOverdue = calculateDaysOverdue(plant);
    
    // Generate a new message
    try {
      const message = await generateWaterReminderMessage({
        name: plant.name,
        species: plant.species || 'plant',
        personalityType: plant.personalityType,
        daysOverdue
      });
      
      // Save the new message
      setMessages(prev => ({
        ...prev,
        [plant.id]: {
          message,
          generatedDate: new Date()
        }
      }));
      
      return message;
    } catch (error) {
      console.error('Error generating water reminder message:', error);
      
      // Return a default message if generation fails
      return `I'm thirsty! It's been ${daysOverdue} days since I was supposed to be watered.`;
    }
  };
  
  // Clear all messages
  const clearMessages = () => {
    setMessages({});
    localStorage.removeItem('waterReminderMessages');
  };
  
  return (
    <WaterReminderContext.Provider value={{ messages, getOrGenerateMessage, clearMessages }}>
      {children}
    </WaterReminderContext.Provider>
  );
}

export function useWaterReminders() {
  const context = useContext(WaterReminderContext);
  if (context === undefined) {
    throw new Error('useWaterReminders must be used within a WaterReminderProvider');
  }
  return context;
} 