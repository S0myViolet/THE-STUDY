import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "The Study", template: "%s · The Study" },
  description: "A private intellectual training environment. Notice more. Understand more. Think further.",
  applicationName: "The Study",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#161513" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Applied before paint so there is no theme flash.
const themeScript = `(function(){try{var p=localStorage.getItem('the-study:appearance')||'system';var d=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light');if(localStorage.getItem('the-study:reduced-motion')==='1'){document.documentElement.setAttribute('data-reduced-motion','true')}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
