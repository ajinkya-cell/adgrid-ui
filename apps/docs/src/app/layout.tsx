import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Caveat, Poppins, EB_Garamond } from "next/font/google";
import localFont from "next/font/local";
import { SiteChrome } from "@/components/site/SiteChrome";
import "./globals.css";

const geistPixel = localFont({
  src: "../../public/fonts/GeistPixel-Regular.woff2",
  variable: "--font-geist-pixel",
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-loaded",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "void/ui — dark-first component library",
  description: "Open source React components built for the void.",
  icons: {
    icon: [
      { url: "/previews/new-fav.png", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/previews/new-fav.png",
    apple: "/previews/new-fav.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${ebGaramond.variable} ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${caveat.variable} ${geistPixel.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Geist+Pixel&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Reenie+Beanie&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-surface font-poppins antialiased selection:bg-white selection:text-black">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
