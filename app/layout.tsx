import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Đăng ký vay vốn | Hỗ trợ tài chính nhanh chóng",
  description:
    "Đăng ký vay vốn trực tuyến nhanh chóng, lãi suất ưu đãi. Điền thông tin để được tư vấn miễn phí.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
