import type { Metadata } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-sans-kr",
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-serif-kr",
});

export const metadata: Metadata = {
  title: "Gallery Lumora — 완성작 구매 · 1:1 커미션",
  description:
    "작가의 화풍을 살펴보고 완성작을 소장하거나, 그 작가에게 나만의 작품을 1:1로 의뢰하세요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`h-full antialiased ${notoSansKR.variable} ${notoSerifKR.variable}`}>
      <body className="flex min-h-full flex-col font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
