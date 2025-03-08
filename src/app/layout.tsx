'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { Figtree } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WaterReminderProvider } from '@/context/WaterReminderContext';
import { metadata } from "./metadata";
import { WaterMessageProvider } from '@/context/WaterMessageContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title as string}</title>
        <meta name="description" content={metadata.description as string} />
        <link rel="icon" href="/images/greenhearts-logo.png" />
        <link rel="apple-touch-icon" href="/images/greenhearts-logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${figtree.variable} antialiased`}
      >
        <AuthProvider>
          <WaterMessageProvider>
            <WaterReminderProvider>
              {children}
            </WaterReminderProvider>
          </WaterMessageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
