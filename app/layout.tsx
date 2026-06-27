import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SonicField Studio",
  description: "Audio-driven raster and vector pattern generator"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
