import "./globals.css";
import type { Metadata } from "next";
import { Shell } from "../components/Shell";
import { FishCursor } from "../components/FishCursor";
import { FishBuddy } from "../components/FishBuddy";
import { NotificationWatcher } from "../components/NotificationWatcher";
import { PWAClient } from "../components/PWAClient";

export const metadata: Metadata = {
  title: "Neuroethology Lab",
  description: "Shared home for the Neuroethology Lab",
  manifest: "/manifest.webmanifest",
  themeColor: "#3892C6",
  applicationName: "Neuroethology Lab",
  icons: {
    icon: "/app-icon.svg",
    shortcut: "/app-icon.svg",
    apple: "/app-icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Neuroethology Lab",
    statusBarStyle: "default",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PWAClient />
        <FishCursor />
        <NotificationWatcher />
        <Shell>{children}</Shell>
        <FishBuddy />
      </body>
    </html>
  );
}
