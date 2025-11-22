import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Security Login Demo",
  description: "Demonstration of security features: Honeyuser trap, Password typo helper, and OTP expiration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

