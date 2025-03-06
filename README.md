# GreenHearts - Plant Watering App

GreenHearts is a web application that helps users keep track of their plants' watering schedules and overall health. The app provides reminders, plant care tips, and personalized recommendations using AI.

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **AI**: Anthropic's Claude API
- **Deployment**: Vercel

## Features (Planned)

- User authentication and profile management
- Plant management (add, edit, delete plants)
- Watering schedule and reminders
- Plant health tracking
- AI-powered plant care recommendations
- Image recognition for plant identification
- Community features (sharing, tips, etc.)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Anthropic API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/greenhearts.git
   cd greenhearts
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables (see `.env.local.example` for reference).

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
greenhearts/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Library code (Firebase, etc.)
│   ├── services/         # API and service functions
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
├── .env.local.example    # Example environment variables
└── README.md             # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Anthropic](https://www.anthropic.com/)
- [Tailwind CSS](https://tailwindcss.com/)
