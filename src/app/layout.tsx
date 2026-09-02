import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const SITE = "https://tessera-wallpapers.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Tessera, a generative wallpaper studio",
    template: "%s / Tessera",
  },
  description:
    "Tessera builds wallpapers from seeds. Pick a family and a palette, tune the composition, then export a pixel perfect image for any phone, tablet or desktop up to 5K.",
  keywords: [
    "wallpapers",
    "generative art",
    "desktop wallpaper",
    "mobile wallpaper",
    "4K wallpaper",
    "abstract backgrounds",
    "canvas art",
  ],
  authors: [{ name: "Tessera" }],
  openGraph: {
    type: "website",
    url: SITE,
    title: "Tessera, a generative wallpaper studio",
    description:
      "Generative wallpapers rendered from seeds and exported pixel perfect for any screen.",
    siteName: "Tessera",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tessera, a generative wallpaper studio",
    description:
      "Generative wallpapers rendered from seeds and exported pixel perfect for any screen.",
  },
  category: "design",
};

export const viewport: Viewport = {
  themeColor: "#0b0b0d",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${display.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
