import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daksh Patel | AI Engineer",
  description: "AI Engineer building intelligent systems—ML, LLMs, Computer Vision, AI Agents & Cybersecurity",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Run before React: prevent mobile/LinkedIn from opening at #projects — start at hero */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                var h = window.location.hash;
                if (h) {
                  history.replaceState(null, '', window.location.pathname + window.location.search);
                }
                window.scrollTo(0, 0);
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#08081a]`}
      >
        {children}
      </body>
    </html>
  );
}
