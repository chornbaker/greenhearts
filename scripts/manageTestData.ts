import { clearUserData, populateTestData } from '../src/services/testData';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import readline from 'readline';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Firebase for Node.js environment
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Main function to manage test data
 */
async function manageTestData() {
  console.log('=== GreenHearts Test Data Manager ===');
  console.log('This utility helps you manage test data in your Firebase database.');
  
  rl.question('Enter the user ID to manage test data for: ', async (userId) => {
    if (!userId) {
      console.error('User ID is required');
      rl.close();
      return;
    }
    
    console.log('\nChoose an action:');
    console.log('1. Clear all test data for this user');
    console.log('2. Populate test data for this user');
    console.log('3. Exit');
    
    rl.question('\nEnter your choice (1-3): ', async (choice) => {
      try {
        switch (choice) {
          case '1':
            console.log(`\nClearing all test data for user ${userId}...`);
            await clearUserData(userId);
            console.log('Test data cleared successfully!');
            break;
            
          case '2':
            console.log(`\nPopulating test data for user ${userId}...`);
            await populateTestData(userId);
            console.log('Test data populated successfully!');
            break;
            
          case '3':
            console.log('Exiting...');
            break;
            
          default:
            console.error('Invalid choice. Please enter a number between 1 and 3.');
            break;
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        rl.close();
      }
    });
  });
}

// Run the utility
manageTestData(); 