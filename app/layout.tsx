import type { Metadata } from "next";
import { EB_Garamond, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-eb-garamond",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  title: "IMS - Inventory Management System",
  description: "IMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ebGaramond.variable} ${hankenGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
