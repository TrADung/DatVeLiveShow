import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MusicPlayer from "@/components/MusicPlayer";
import { ThemeProvider } from "@/context/ThemeContext";

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
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedTheme = localStorage.getItem('dtu_theme') || 'light';
                document.documentElement.setAttribute('data-theme', savedTheme);
                document.documentElement.classList.add(savedTheme);
              } catch (e) {
                document.documentElement.setAttribute('data-theme', 'light');
                document.documentElement.classList.add('light');
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen antialiased selection:bg-[#E53935] selection:text-white transition-colors duration-200`}>
        <ThemeProvider>
          {children}
          <MusicPlayer />
        </ThemeProvider>
      </body>
    </html>
  );
}
