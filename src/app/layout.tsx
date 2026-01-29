import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Claud.io",
  description: "La casa de cristal del pensamiento",
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
        <div className="drag-region fixed top-0 left-0 right-0 h-7 z-50" />

        {/* Main content with padding for title bar */}
        <main className="pt-7 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
