import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoL | Shelter of Love",
  description: "Adoption and Donation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Pull in Tabler Icons to match your UI prototype */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}