import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

/**
 * Upload a file to Firebase Storage
 * @param file The file to upload
 * @param path The path in storage where the file should be stored
 * @returns The download URL of the uploaded file
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  try {
    if (!storage) throw new Error('Firebase Storage is not initialized');
    
    // Create a reference to the file location
    const storageRef = ref(storage, path);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Upload a plant image to Firebase Storage
 * @param userId The user ID
 * @param file The image file to upload
 * @returns The download URL of the uploaded image
 */
export async function uploadPlantImage(userId: string, file: File): Promise<string> {
  try {
    // Generate a unique filename using timestamp and original file extension
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const filename = `${timestamp}.${fileExtension}`;
    
    // Create the storage path: plants/{userId}/{filename}
    const path = `plants/${userId}/${filename}`;
    
    return await uploadFile(file, path);
  } catch (error) {
    console.error('Error uploading plant image:', error);
    throw error;
  }
}

/**
 * Delete a file from Firebase Storage
 * @param url The full URL of the file to delete
 * @returns A promise that resolves when the file is deleted
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    if (!storage) throw new Error('Firebase Storage is not initialized');
    
    // Extract the path from the URL
    // This is a simplistic approach and might need adjustment based on your actual URL format
    const storageRef = ref(storage, url);
    
    // Delete the file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Delete a file from Firebase Storage by path
 * @param path The storage path of the file to delete
 * @returns A promise that resolves when the file is deleted
 */
export async function deleteFileByPath(path: string): Promise<void> {
  try {
    if (!storage) throw new Error('Firebase Storage is not initialized');
    
    // Create a reference to the file
    const storageRef = ref(storage, path);
    
    // Delete the file
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
} 