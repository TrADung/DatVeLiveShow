import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MusicPlayer from "@/components/MusicPlayer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Live Show Sinh Nhật CLB - SẮC I. VÁN CỜ",
  description: "Đặt vé tham dự đêm nhạc sinh nhật CLB DTU Acoustic - SẮC I. VÁN CỜ. Phong cách Bàn Cờ Vua Trắng - Đỏ - Đen sang trọng và hiện đại.",
  keywords: "live show, âm nhạc, câu lạc bộ, sinh nhật, đặt vé, dtu acoustic, sắc i ván cờ",
  openGraph: {
    title: "Live Show Sinh Nhật CLB - SẮC I. VÁN CỜ",
    description: "Đêm nhạc sinh nhật CLB DTU Acoustic - Trải nghiệm âm nhạc đỉnh cao theo phong cách SẮC I. VÁN CỜ.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-[#0D0D0D] text-white min-h-screen antialiased selection:bg-[#E53935] selection:text-white`}>
        {children}
        <MusicPlayer />
      </body>
    </html>
  );
}
