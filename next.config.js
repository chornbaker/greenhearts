/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: [
      'lh3.googleusercontent.com',  // Google profile images
      'firebasestorage.googleapis.com', // Firebase Storage
      'avatars.githubusercontent.com', // GitHub avatars
      'graph.facebook.com', // Facebook profile images
      'pbs.twimg.com', // Twitter profile images
    ],
  },
};

module.exports = nextConfig; 