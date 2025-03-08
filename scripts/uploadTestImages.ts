import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../src/lib/firebase';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a temporary directory for downloaded images
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Plant image URLs - these are realistic plant images from Unsplash
const plantImages = [
  {
    name: 'monstera.jpg',
    url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'fiddle-leaf-fig.jpg',
    url: 'https://images.unsplash.com/photo-1597055181449-b9d2a4598b52?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'snake-plant.jpg',
    url: 'https://images.unsplash.com/photo-1593482892290-f54927ae2b7a?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'pothos.jpg',
    url: 'https://images.unsplash.com/photo-1622548066678-43fcecbdec47?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'peace-lily.jpg',
    url: 'https://images.unsplash.com/photo-1616690248363-76f93926e6f2?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'zz-plant.jpg',
    url: 'https://images.unsplash.com/photo-1632207691143-7ee8c82f6e98?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'aloe-vera.jpg',
    url: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'spider-plant.jpg',
    url: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'rubber-plant.jpg',
    url: 'https://images.unsplash.com/photo-1594134235043-3a3aeb0c3264?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'boston-fern.jpg',
    url: 'https://images.unsplash.com/photo-1614594604854-eb6e3f4dd5d3?q=80&w=800&auto=format&fit=crop',
  },
];

/**
 * Download an image from a URL and save it to the temp directory
 */
async function downloadImage(url: string, filename: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const buffer = await response.arrayBuffer();
  const filePath = path.join(tempDir, filename);
  
  fs.writeFileSync(filePath, Buffer.from(buffer));
  console.log(`Downloaded ${filename}`);
  
  return filePath;
}

/**
 * Upload an image to Firebase Storage
 */
async function uploadImageToFirebase(filePath: string, filename: string): Promise<string> {
  if (!storage) throw new Error('Firebase Storage is not initialized');
  
  const imageBuffer = fs.readFileSync(filePath);
  const storageRef = ref(storage, `test-plants/${filename}`);
  
  await uploadBytes(storageRef, imageBuffer);
  const downloadUrl = await getDownloadURL(storageRef);
  
  console.log(`Uploaded ${filename} to Firebase Storage`);
  console.log(`Download URL: ${downloadUrl}`);
  
  return downloadUrl;
}

/**
 * Main function to download and upload all images
 */
async function uploadAllImages() {
  try {
    console.log('Starting image upload process...');
    
    for (const image of plantImages) {
      const filePath = await downloadImage(image.url, image.name);
      await uploadImageToFirebase(filePath, image.name);
    }
    
    console.log('All images uploaded successfully!');
    
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
    console.log('Temporary files cleaned up');
  } catch (error) {
    console.error('Error uploading images:', error);
  }
}

// Run the upload process
uploadAllImages(); 