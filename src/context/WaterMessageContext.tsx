import { createContext, useContext, useState, useEffect } from 'react';
import { Plant } from '@/types';
import { getDaysOverdue, isDueToday } from '@/utils/dateUtils';

type WaterMessage = {
  message: string;
  generatedDate: Date;
};

type WaterMessageContextType = {
  getWaterMessage: (plant: Plant) => string | null;
  generateDailyMessages: (plants: Plant[]) => void;
};

const generateMessageForPlant = (plant: Plant, isOverdue: boolean): string => {
  const personality = plant.personalityType || 'friendly';
  const daysOverdue = getDaysOverdue(plant);
  const location = plant.location ? ` in the ${plant.location.toLowerCase()}` : '';
  const displayName = plant.userDisplayName || '';
  
  // Check if the plant is due today but not overdue
  const isToday = isDueToday(plant);

  const messages = {
    cheerful: {
      today: [
        `"It's my special day${location}! Time for my refreshing drink! Can't wait, ${displayName}! 💚✨"`,
        `"Today's the day! Ready for my spa treatment${location}! You're the best, ${displayName}! 🌿"`,
        `"Yay! My watering day is here! Let's make it rain${location}! 💫"`,
        `"${displayName}, I'm so excited for my water break today! Let's grow together! 🌱"`
      ],
      normal: [
        `"Yay! It's watering day${location}! 💚 Can't wait to feel refreshed!"`,
        `"Oh my goodness, ${displayName}! Water time! This is my favorite part of the day! ✨"`,
        `"Time for my spa day${location}! I've been looking forward to this! 🌿"`,
        `"Water time means growth time! Let's do this, ${displayName}! 🌱"`
      ],
      overdue: [
        `"*Wilting dramatically${location}* Day ${daysOverdue} without water... but I'm staying positive! 😅"`,
        `"${displayName}, I don't mean to be needy, but... water please? 🥺"`,
        `"A little parched over here${location}, but I know you're doing your best! 💕"`,
        `"Better late than never for a drink! Still love you, ${displayName}! 🌿"`
      ]
    },
    sassy: {
      today: [
        `"Darling ${displayName}, today's MY day${location}! Ready for my hydration appointment! 💅✨"`,
        `"Finally! My scheduled pampering session${location}! Don't keep a queen waiting! 👑"`,
        `"Today's forecast: 100% chance of fabulous hydration! Ready when you are${location}! 💫"`,
        `"${displayName}, I've cleared my schedule for our water date! Let's make it fashion! 🌟"`
      ],
      normal: [
        `"Finally, my time to shine${location}! Don't skimp on the water, darling! 💅"`,
        `"Ready for my hydration treatment! Make it rain, ${displayName}! ✨"`,
        `"Ah yes, water o'clock! You know I only accept the finest H2O${location}! 🌟"`,
        `"Time to quench my thirst! Don't keep a plant waiting, ${displayName}! 💫"`
      ],
      overdue: [
        `"${daysOverdue} days late? I'm writing this down in my diary, ${displayName}... 📝"`,
        `"Oh, NOW you remember I exist${location}? How generous... 🙄"`,
        `"I suppose better late than never... but punctuality is a virtue, darling! 💅"`,
        `"*Leaves drooping judgmentally${location}* 🌿"`
      ]
    },
    shy: {
      today: [
        `"Um... today's my watering day${location}... I'm kind of excited... 🌱✨"`,
        `"${displayName}... I've been looking forward to our water time today... 💧"`,
        `"Today's the day for water... I've been practicing my thank you speech${location}... 🌿"`,
        `"Water day is here... feeling special and a tiny bit brave... ✨"`
      ],
      normal: [
        `"Um... it's water time${location}... if you're not too busy... 🌱"`,
        `"${displayName}... a little water would be nice... only if it's okay... 💧"`,
        `"I hope it's not too much trouble, but I'm ready for watering${location}... 🌿"`,
        `"Water day is my favorite... quietly excited to see you, ${displayName}... ✨"`
      ],
      overdue: [
        `"I don't want to bother you, but it's been ${daysOverdue} days${location}... 👉👈"`,
        `"A bit thirsty... but take your time, ${displayName}... no pressure... 💭"`,
        `"Maybe you forgot about me${location}? It's okay... I understand... 🥺"`,
        `"Just a gentle reminder about water... if you have a moment, ${displayName}... 🌱"`
      ]
    },
    grumpy: {
      today: [
        `"Well, well, it's watering day${location}. At least you're on time today... 🌿"`,
        `"${displayName}, I suppose we should get this watering business over with... 💧"`,
        `"*checking calendar* Ah yes, water day${location}. Let's get on with it... 🙄"`,
        `"Today's the day, huh? Fine, I'll prepare myself for this 'refreshing' experience... 🌱"`
      ],
      normal: [
        `"Oh great, water time${location}. Try not to drown me this time... 🌿"`,
        `"Fine, ${displayName}, I suppose I could use some water... whatever... 💧"`,
        `"Water day again? As if I haven't survived millennia${location} without your help... 🙄"`,
        `"Yes, yes, time for my 'essential hydration' or whatever... 🌱"`
      ],
      overdue: [
        `"${daysOverdue} days late? I'm not even surprised anymore${location}... 😒"`,
        `"Oh look who finally remembered I exist, ${displayName}! How thoughtful... 🙄"`,
        `"I've known cacti more reliable than you${location}... 🌵"`,
        `"I'm fine... totally fine... *leaves crisp angrily${location}* 😤"`
      ]
    },
    friendly: {
      today: [
        `"Today's the big day${location}! Can't wait for our watering session, ${displayName}! 💚"`,
        `"It's water o'clock! Perfect timing for our daily care routine${location}! 🌿"`,
        `"${displayName}, I've been looking forward to our water date today! Let's make it count! ✨"`,
        `"Water day is here! Ready to grow and thrive with you${location}! 🌱"`
      ],
      normal: [
        `"Water time! Thanks for taking such good care of me${location}, ${displayName}! 💚"`,
        `"Ready for my daily drink! You're the best plant parent! 🌿"`,
        `"Yay, water time${location}! Always look forward to our little moments! ✨"`,
        `"Time for refreshment! Thanks for being so reliable, ${displayName}! 🌱"`
      ],
      overdue: [
        `"Hey ${displayName}! Just a reminder - I'm ${daysOverdue} days overdue for water${location}! 💧"`,
        `"Could use a drink when you have a moment${location}! No rush! 🌿"`,
        `"A little thirsty over here, but I know you'll take care of me, ${displayName}! 💚"`,
        `"Water would be great${location}... whenever you're ready! 🌱"`
      ]
    }
  };

  const personalityMessages = messages[personality as keyof typeof messages] || messages.friendly;
  const messageArray = isToday ? personalityMessages.today : 
                      isOverdue ? personalityMessages.overdue : 
                      personalityMessages.normal;
  const randomIndex = Math.floor(Math.random() * messageArray.length);
  
  return messageArray[randomIndex];
};

const WaterMessageContext = createContext<WaterMessageContextType | undefined>(undefined);

export function WaterMessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Record<string, WaterMessage>>({});

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('waterMessages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        
        // Convert string dates back to Date objects
        const messagesWithDates: Record<string, WaterMessage> = {};
        Object.entries(parsed).forEach(([key, value]: [string, any]) => {
          messagesWithDates[key] = {
            ...value,
            generatedDate: new Date(value.generatedDate)
          };
        });
        
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Error loading water messages:', error);
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('waterMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving water messages:', error);
    }
  }, [messages]);

  const isMessageExpired = (message: WaterMessage) => {
    const today = new Date();
    const messageDate = new Date(message.generatedDate);
    return messageDate.getDate() !== today.getDate() ||
           messageDate.getMonth() !== today.getMonth() ||
           messageDate.getFullYear() !== today.getFullYear();
  };

  const getWaterMessage = (plant: Plant): string | null => {
    const message = messages[plant.id];
    if (!message || isMessageExpired(message)) {
      return null;
    }
    return message.message;
  };

  const generateDailyMessages = (plants: Plant[]) => {
    const today = new Date();
    const newMessages = { ...messages };

    plants.forEach(plant => {
      const existingMessage = messages[plant.id];
      if (!existingMessage || isMessageExpired(existingMessage)) {
        const isOverdue = plant.nextWateringDate ? new Date(plant.nextWateringDate) < today : false;
        newMessages[plant.id] = {
          message: generateMessageForPlant(plant, isOverdue),
          generatedDate: today
        };
      }
    });

    setMessages(newMessages);
  };

  return (
    <WaterMessageContext.Provider value={{ getWaterMessage, generateDailyMessages }}>
      {children}
    </WaterMessageContext.Provider>
  );
}

export const useWaterMessages = () => {
  const context = useContext(WaterMessageContext);
  if (context === undefined) {
    throw new Error('useWaterMessages must be used within a WaterMessageProvider');
  }
  return context;
}; 