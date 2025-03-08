import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'lh3.googleusercontent.com',  // Google profile images
      'firebasestorage.googleapis.com', // Firebase Storage
      'storage.googleapis.com',     // Firebase Storage (alternate format)
      'avatars.githubusercontent.com', // GitHub avatars
      'graph.facebook.com', // Facebook profile images
      'pbs.twimg.com', // Twitter profile images
      'images.unsplash.com', // Unsplash images
    ],
  },
};

export default nextConfig;
