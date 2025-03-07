'use client';

import { Geist, Geist_Mono } from "next/font/google";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { metadata } from "./metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
