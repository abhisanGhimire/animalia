import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/lib/settings";
import Header from "@/components/Header";

const display = Fredoka({ variable: "--font-display", subsets: ["latin"] });
const body = Nunito({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Animalia: Explore Every Animal",
  description: "A kid-friendly animal encyclopedia with maps, quizzes, comparisons and drawing lessons.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="kid" data-theme="light" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <body className="min-h-screen">
        <SettingsProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-card focus:p-3">Skip to content</a>
          <Header />
          <main id="main" className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted">
            Animalia is a learning project. Facts are drafted from general knowledge and are marked &quot;not yet verified&quot; until checked against sources like the IUCN Red List. Pictures are emoji placeholders for now.
          </footer>
        </SettingsProvider>
      </body>
    </html>
  );
}
