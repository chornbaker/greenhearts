import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

console.log('Storage bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the test images
const imagesDir = path.join(__dirname, '..', 'public', 'test-images');

// Check if the directory exists
if (!fs.existsSync(imagesDir)) {
  console.error(`Error: Directory ${imagesDir} does not exist.`);
  console.log('Please run "npm run download-test-images" first to download the test images.');
  process.exit(1);
}

// Get all image files from the directory
const imageFiles = fs.readdirSync(imagesDir)
  .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
  .map(file => ({
    name: file,
    path: path.join(imagesDir, file)
  }));

if (imageFiles.length === 0) {
  console.error('No image files found in the directory.');
  console.log('Please run "npm run download-test-images" first to download the test images.');
  process.exit(1);
}

/**
 * Upload an image to Firebase Storage
 */
async function uploadImageToFirebase(filePath: string, filename: string): Promise<string> {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const storageRef = ref(storage, `test-plants/${filename}`);
    
    console.log(`Uploading ${filename} to Firebase Storage...`);
    await uploadBytes(storageRef, imageBuffer);
    
    const downloadUrl = await getDownloadURL(storageRef);
    console.log(`Uploaded ${filename} to Firebase Storage`);
    console.log(`Download URL: ${downloadUrl}`);
    
    return downloadUrl;
  } catch (error) {
    console.error(`Error uploading ${filename}:`, error);
    throw error;
  }
}

/**
 * Main function to upload all images
 */
async function uploadAllImages() {
  try {
    console.log('Starting image upload process...');
    console.log(`Found ${imageFiles.length} images in ${imagesDir}`);
    
    const uploadResults = [];
    
    for (const image of imageFiles) {
      try {
        const downloadUrl = await uploadImageToFirebase(image.path, image.name);
        uploadResults.push({
          name: image.name,
          url: downloadUrl
        });
      } catch (error) {
        console.error(`Error processing ${image.name}:`, error);
        // Continue with next image
      }
    }
    
    console.log('All images uploaded successfully!');
    
    // Generate code for testData.ts
    console.log('\nCopy the following URLs into your testData.ts file:');
    console.log('---------------------------------------------------');
    uploadResults.forEach(result => {
      console.log(`${result.name.replace('.jpg', '')}: '${result.url}',`);
    });
    console.log('---------------------------------------------------');
    
    // Save URLs to a JSON file for reference
    const urlsFile = path.join(__dirname, 'image-urls.json');
    fs.writeFileSync(urlsFile, JSON.stringify(uploadResults, null, 2));
    console.log(`URLs saved to ${urlsFile}`);
  } catch (error) {
    console.error('Error uploading images:', error);
  }
}

// Run the upload process
uploadAllImages(); 