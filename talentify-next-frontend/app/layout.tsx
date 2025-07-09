import React from "react";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Inter, Noto_Sans_JP } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
});

export const metadata = {
  title: "Talentify",
  description: "パチンコ店と演者をつなぐマッチングプラットフォーム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${noto.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
