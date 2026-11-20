import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "NexaAI is a modern AI Tools Hub that unifies chat, writing, translation, coding, email, and resume tools in one professional workspace.";

export const metadata: Metadata = {
  title: {
    default: "NexaAI — One Workspace. Smarter AI.",
    template: "%s · NexaAI",
  },
  description: siteDescription,
  applicationName: "NexaAI",
  keywords: [
    "NexaAI",
    "AI tools hub",
    "Gemini",
    "AI chat",
    "AI writer",
    "translator",
    "code assistant",
    "resume builder",
  ],
  authors: [{ name: "NexaAI" }],
  creator: "NexaAI",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NexaAI",
    title: "NexaAI — One Workspace. Smarter AI.",
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: "NexaAI — One Workspace. Smarter AI.",
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-hidden font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var mode=localStorage.getItem('nexaai-theme-mode');var prefs=localStorage.getItem('nexaai-preferences-v1');if(!mode&&prefs){try{mode=JSON.parse(prefs).theme;}catch(e){}}var dark=mode==='dark'||((mode==='system'||!mode||mode==='null')&&(localStorage.getItem('nexaai-theme')==='dark'||(!localStorage.getItem('nexaai-theme')&&matchMedia('(prefers-color-scheme: dark)').matches)));if(mode==='light'){dark=false;}if(dark){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
