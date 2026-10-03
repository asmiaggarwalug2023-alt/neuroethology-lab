import "./globals.css";
import type { Metadata } from "next";
import { Shell } from "../components/Shell";
import { FishCursor } from "../components/FishCursor";
import { FishBuddy } from "../components/FishBuddy";
import { NotificationWatcher } from "../components/NotificationWatcher";

export const metadata: Metadata = {
  title: "Neuroethology Lab",
  description: "Shared home for the Neuroethology Lab",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <FishCursor />
        <NotificationWatcher />
        <Shell>{children}</Shell>
        <FishBuddy />
      </body>
    </html>
  );
}
