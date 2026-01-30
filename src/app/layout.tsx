import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Claud.io",
  description: "La casa de cristal del pensamiento - Personal AI Command Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} antialiased`}>
        {/* Title bar drag region for Mac */}
        <div className="drag-region fixed top-0 left-0 right-0 h-7 z-[100]" />

        {/* Main content with padding for title bar */}
        <div className="pt-7 h-screen overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
