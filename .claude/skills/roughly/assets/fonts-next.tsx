// Next.js App Router: app/layout.tsx
// Caveat via next/font (self-hosted, no layout shift) exposed as --font-caveat, which Roughly reads.
// Kalam / Reenie Beanie keep their real family names only through the Google Fonts <link>,
// so load them that way if you use labelFont="kalam" | "reenie-beanie".
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={caveat.variable}>
      <head>
        {/* Only if you use Kalam or Reenie Beanie: */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Reenie+Beanie&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
