# GreenHearts Test Data Management Scripts

This directory contains scripts for managing test data in the Firebase database for the GreenHearts application.

## Prerequisites

Before running these scripts, make sure you have:

1. Node.js installed (v18 or higher recommended)
2. Firebase project set up with Firestore and Storage
3. Firebase configuration in `.env.local` file

## Available Scripts

### Upload Test Images

This script downloads plant images from Unsplash and uploads them to Firebase Storage. These images are used by the test data population script.

```bash
npm run upload-test-images
```

**Note:** You only need to run this script once to set up the test images in your Firebase Storage.

### Manage Test Data

This interactive command-line utility helps you manage test data for a specific user.

```bash
npm run manage-test-data
```

The script will:
1. Ask for a user ID (this should be a valid Firebase Auth user ID)
2. Provide options to:
   - Clear all test data for the user
   - Populate test data for the user
   - Exit

## Web Interface

For a more user-friendly approach, you can also manage test data directly from the dashboard in the web application. Look for the "Manage Test Data" button in the top-right corner of the dashboard.

## Test Data Structure

The test data includes:

1. **Plants**: A collection of 10 different plant types with realistic information:
   - Monstera Deliciosa
   - Fiddle Leaf Fig
   - Snake Plant
   - Pothos
   - Peace Lily
   - ZZ Plant
   - Aloe Vera
   - Spider Plant
   - Rubber Plant
   - Boston Fern

Each plant includes:
- Name and species
- Location (room)
- Watering schedule
- Last watered date (randomized)
- Next watering date (calculated based on frequency)
- Health status
- Notes with care instructions
- Image URL from Firebase Storage

## Development Notes

- The test data is designed to provide a realistic testing environment with various plant types, watering schedules, and locations.
- The watering dates are randomized to ensure some plants need watering and others don't.
- All test data is associated with the specified user ID, so it won't interfere with other users' data.
- The scripts use batch operations for efficiency and to ensure atomicity of operations. 