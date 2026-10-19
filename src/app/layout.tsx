import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Live Show Sinh Nhật CLB - Chess Night",
  description: "Đặt vé tham dự đêm nhạc sinh nhật câu lạc bộ âm nhạc - Chess Night. Mua vé online nhanh chóng, tiện lợi.",
  keywords: "live show, âm nhạc, câu lạc bộ, sinh nhật, đặt vé",
  openGraph: {
    title: "Live Show Sinh Nhật CLB - Chess Night",
    description: "Đêm nhạc sinh nhật câu lạc bộ âm nhạc - Trải nghiệm âm nhạc đỉnh cao theo phong cách Chess Tournament.",
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
      <body className={`${inter.className} bg-[#121212] text-white`}>
        {children}
      </body>
    </html>
  );
}
