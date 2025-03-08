import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to save the images
const imagesDir = path.join(__dirname, '..', 'public', 'test-images');

// Ensure the directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Plant image URLs - these are realistic plant images from Unsplash
const plantImages = [
  {
    name: 'monstera.jpg',
    url: 'https://images.unsplash.com/photo-1637967886160-fd78dc3ce3f5?w=800&auto=format&fit=crop',
  },
  {
    name: 'fiddle-leaf-fig.jpg',
    url: 'https://images.unsplash.com/photo-1508022713622-df2d8fb7b4cd?w=800&auto=format&fit=crop',
  },
  {
    name: 'snake-plant.jpg',
    url: 'https://images.unsplash.com/photo-1620127252536-03bdfcf6d5c3?w=800&auto=format&fit=crop',
  },
  {
    name: 'pothos.jpg',
    url: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=800&auto=format&fit=crop',
  },
  {
    name: 'peace-lily.jpg',
    url: 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=800&auto=format&fit=crop',
  },
  {
    name: 'zz-plant.jpg',
    url: 'https://images.unsplash.com/photo-1632207171349-a0f0ec0e23c9?w=800&auto=format&fit=crop',
  },
  {
    name: 'aloe-vera.jpg',
    url: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=800&auto=format&fit=crop',
  },
  {
    name: 'spider-plant.jpg',
    url: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=800&auto=format&fit=crop',
  },
  {
    name: 'rubber-plant.jpg',
    url: 'https://images.unsplash.com/photo-1638824097313-8a42fef7c87c?w=800&auto=format&fit=crop',
  },
  {
    name: 'boston-fern.jpg',
    url: 'https://images.unsplash.com/photo-1597305877032-0668b3c6413a?w=800&auto=format&fit=crop',
  },
];

/**
 * Download an image from a URL and save it to the specified directory
 */
async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    const filePath = path.join(imagesDir, filename);
    
    fs.writeFileSync(filePath, Buffer.from(buffer));
    console.log(`Downloaded ${filename} to ${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error(`Error downloading ${filename}:`, error);
    throw error;
  }
}

/**
 * Main function to download all images
 */
async function downloadAllImages() {
  try {
    console.log('Starting image download process...');
    console.log(`Saving images to: ${imagesDir}`);
    
    const downloadedFiles = [];
    
    for (const image of plantImages) {
      try {
        const filePath = await downloadImage(image.url, image.name);
        downloadedFiles.push(filePath);
      } catch (error) {
        console.error(`Error processing ${image.name}:`, error);
        // Continue with next image
      }
    }
    
    console.log('All images downloaded successfully!');
    console.log(`Downloaded ${downloadedFiles.length} images to ${imagesDir}`);
    
    // List all downloaded files
    console.log('Downloaded files:');
    downloadedFiles.forEach(file => {
      console.log(`- ${path.basename(file)}`);
    });
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

// Run the download process
downloadAllImages(); 