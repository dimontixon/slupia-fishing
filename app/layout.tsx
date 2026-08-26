import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4, Nunito_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Used only by the public site's "Natura" theme (see .theme-natura in
// globals.css) — latin-ext is required for Polish diacritics (ą/ę/ł/ń/ó/ś/ź/ż).
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Łowisko Słupia — rezerwacja sektorów",
  description: "Rezerwacja sektorów wędkarskich nad stawem Słupia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pl"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
