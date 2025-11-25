import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Online Obligation & Disbursement System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[100dvh] min-w-full border border-blue-300 flex flex-col items-center  gap-10`}
      >
        <h1
          className={`${geistSans.variable} ${geistMono.variable} text-2xl font-bold`}
        >
          Online Obligation & Disbursement System
        </h1>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
