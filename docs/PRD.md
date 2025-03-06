# GreenHearts - Product Requirements Document (PRD)

## 1. Overview

### Purpose
GreenHearts is a simple, intuitive, and user-friendly web application designed to help plant owners manage their plant care with automated watering schedules and a fun, personal twist. The app allows users to add plants, generate AI-powered watering schedules, track watering history, sync schedules to Google Calendar, and receive cute, personalized messages from their plants. The MVP focuses on core functionality while prioritizing a delightful user experience.

### Target Audience
- Plant owners (beginners and enthusiasts) who want an easy way to manage watering schedules.
- Users who appreciate a playful, personal connection with their plants (e.g., naming plants, assigning personalities).
- Tech-savvy individuals comfortable with web apps and Google integrations.

### Platform
- Web app (responsive design for mobile and desktop).
- Future potential: iOS app if the MVP gains traction.

---

## 2. User Stories

As a user, I want to:
1. Sign in with Google so I can quickly create an account without filling out forms.
2. Add a plant with basic info and a photo so I can get a personalized watering schedule.
3. Have GreenHearts suggest a name and personality for my plant (or choose manually) so it feels more personal and fun.
4. See a daily watering schedule so I know which plants to water and how much.
5. Sync my watering schedule to Google Calendar so it integrates with my routine.
6. Log when I water a plant (with a simple button) and optionally edit details if needed.
7. Receive personalized in-app messages from my plants so I’m reminded to water them in a cute way.

---

## 3. Feature Breakdown

### 3.1 User Authentication
- **Description:** Users sign in using Google Sign-In via Firebase Authentication.
- **Requirements:**
  - One-click Google Sign-In button on the landing page.
  - Redirect to the homepage (“My Garden”) after successful login.
  - Store minimal user data (UID, email, garden name) in Firebase Firestore.

### 3.2 Add Plant
- **Description:** Users can add a plant with basic info, a photo, and a name/personality.
- **Requirements:**
  - "+ Add Plant" button on the homepage.
  - Step-by-step form:
    1. **Basic Info (Questionnaire):** Plant type (text input), environmental conditions (dropdown: Indoor/Outdoor, Sunlight: Low/Medium/High), soil type (dropdown: Sandy/Loamy/Clay), pot size (dropdown: Small/Medium/Large), last watered date (date picker).
    2. **Photo Upload:** Upload one or more photos (store in Firebase Storage, display thumbnails).
    3. **Name & Personality:**
       - Option 1: AI-generated name and personality using Anthropic’s Claude API (based on plant type).
       - Option 2: Manual input (name as text, personality from dropdown: Sassy/Chill/Needy/Cheerful/Grumpy).
       - If AI-generated, user can accept or retry with a “Generate Another” button.
  - Save plant data to Firestore.

### 3.3 AI-Generated Watering Schedule
- **Description:** Use Anthropic’s Claude API to generate a watering schedule based on plant info.
- **Requirements:**
  - Input: Plant type, environmental conditions, soil type, pot size, last watered date.
  - Prompt Claude with structured input (e.g., “Generate a watering schedule for a Monstera, indoor, medium sunlight, loamy soil, medium pot, last watered 3 days ago”).
  - Output: Structured JSON (e.g., `{ "frequency": "every 5 days", "amount": "150ml", "general_guidance": "a medium cup" }`).
  - Store schedule in Firestore as part of the plant’s data.

### 3.4 Daily Watering Schedule
- **Description:** Display a consolidated daily list of plants that need watering.
- **Requirements:**
  - Homepage or dedicated “Schedule” page shows a daily list (e.g., “Today: Water Spike (Cactus) with 50ml (a small cup), Water Ferny (Fern) with 150ml (a medium cup)”).
  - Include a “Watered!” button next to each task to log watering (see 3.6).
  - Allow scrolling to future/past days for planning.

### 3.5 Google Calendar Sync
- **Description:** Allow users to sync their watering schedule to Google Calendar.
- **Requirements:**
  - “Sync to Google Calendar” button on the Schedule page.
  - Use Google Calendar API to create events (e.g., “Water Spike” every 7 days, “Water Ferny” every 4 days).
  - Events include plant name, amount, and general guidance in the description.
  - Re-sync option if the schedule changes (delete old events, create new ones).

### 3.6 Log Watering
- **Description:** Users can log when they water a plant with a simple button and optional edits.
- **Requirements:**
  - “Watered!” button next to each plant in the daily schedule or plant card.
  - Default: Logs current timestamp and assumes recommended amount watered.
  - Edit option: Modify date/time, amount watered, and add notes (e.g., “Looked droopy”).
  - Save watering history in Firestore as part of the plant’s data.

### 3.7 Personalized Messages (In-App Notifications)
- **Description:** Plants send cute, personality-based messages to remind users to water them.
- **Requirements:**
  - Use Anthropic’s Claude API to generate messages (e.g., “Spike says: ‘I’m parched! Gimme some water!’” for a Grumpy cactus).
  - Display as in-app notifications (styled as speech bubbles) on the homepage or schedule page.
  - Trigger notifications daily for plants that need watering.
  - Modular design to support future SMS/WhatsApp integration (e.g., using Twilio).

### 3.8 My Garden (Plant Collection)
- **Description:** Homepage displays the user’s collection of plants.
- **Requirements:**
  - Default name: “My Garden” (editable via text input in settings or homepage).
  - List of plant cards with photo, name, personality, and quick stats (e.g., “Next watering: Tomorrow”).
  - Click a plant card to view details (info, schedule, watering history).

---

## 4. UI/UX Suggestions

### 4.1 Homepage (“My Garden”)
- Header: “My Garden” (editable name) with a “+ Add Plant” button.
- List of plant cards:
  - Photo thumbnail, name, personality.
  - Quick stats: “Next watering: [date]”.
  - Click to view details.
- Optional notification bar at the top: “Spike needs water today!”

### 4.2 Add Plant Form
- Step 1: Basic Info (questionnaire with dropdowns and inputs).
- Step 2: Upload Photo (drag-and-drop or file picker).
- Step 3: Name & Personality (AI-generated option with “Generate Another” or manual input).
- “Save Plant” button to confirm.

### 4.3 Schedule Page
- Daily list: “Today: Water Spike (Cactus) with 50ml (a small cup)” with a “Watered!” button.
- Scrollable to future/past days.
- “Sync to Google Calendar” button at the top.

### 4.4 Notifications
- Styled as speech bubbles: “Spike says: ‘I’m parched! Gimme some water!’”
- Appears on homepage or schedule page when a plant needs watering.
- Dismissable but reappears daily until watered.

---

## 5. Data Model (Firebase Firestore)

### 5.1 Users Collection
- Path: `/users/{uid}`
- Fields:
  - `uid`: String (Firebase UID)
  - `email`: String
  - `gardenName`: String (default: “My Garden”)

### 5.2 Plants Collection
- Path: `/plants/{plantId}`
- Fields:
  - `plantId`: String (auto-generated)
  - `userId`: String (links to user)
  - `name`: String (e.g., “Spike”)
  - `type`: String (e.g., “Cactus”)
  - `photoUrls`: Array<String> (URLs from Firebase Storage)
  - `personality`: String (e.g., “Grumpy”)
  - `conditions`: Object (e.g., `{ location: "Indoor", sunlight: "Medium", soil: "Sandy", potSize: "Small" }`)
  - `lastWatered`: Timestamp
  - `schedule`: Object (e.g., `{ frequency: "every 7 days", amount: "50ml", generalGuidance: "a small cup" }`)
  - `wateringHistory`: Array<Object> (e.g., `[{ date: Timestamp, amount: "50ml", notes: "Looked healthy" }]`)

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Page load times under 2 seconds.
- API calls (e.g., Anthropic, Google Calendar) should have loading states.

### 6.2 Security
- Firebase Authentication for secure user access.
- Firestore security rules to ensure users only access their own data.
- Google Calendar API OAuth for secure calendar access.

### 6.3 Scalability
- Firebase Firestore for scalable database.
- Modular notification system to support future SMS/WhatsApp integration.

---

## 7. Future Considerations
- SMS/WhatsApp integration for plant messages using Twilio.
- AI-powered plant type detection from photos.
- Mobile app (iOS/Android) using frameworks like Capacitor or React Native.
- Social features (e.g., share plant photos with friends).
- Advanced AI for more nuanced watering schedules (e.g., weather data integration).

---

## 8. Assumptions & Constraints
- Users have Google accounts for sign-in and calendar integration.
- Anthropic’s Claude API provides reliable watering schedule outputs.
- Web app is the initial focus; mobile apps are out of scope for MVP.
- SMS/WhatsApp integration is deferred to post-MVP.

---

## 9. Success Metrics
- User engagement: 50% of users add at least one plant within the first week.
- Retention: 30% of users return daily to check schedules or log watering.
- Feature usage: 50% of users sync to Google Calendar.
- Feedback: Positive user feedback on personalized messages (survey or reviews).

---

### Changes Made for Branding
- Updated all references to the app name from "Plant Watering App" to **"GreenHearts"**.
- Adjusted user stories and requirements to include the GreenHearts branding where relevant.
- Kept the core functionality and structure intact, as the name change doesn’t impact the features or scope.
