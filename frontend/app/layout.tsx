import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Medinator",
  description: "Medinator is a tool that helps you manage your health and well-being",
  icons: {
    icon: '/medinator.png',
    shortcut: '/medinator.png',
    apple: '/medinator.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased h-screen overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
