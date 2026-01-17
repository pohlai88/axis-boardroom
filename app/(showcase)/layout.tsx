import { ThemeToggle } from "@/components/features/theme/theme-toggle";
import Link from "next/link";
import { Home } from "lucide-react";

export default function ShowcaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
              >
                <Home className="h-5 w-5" />
                <span>AXIS BoardRoom</span>
              </Link>
              <nav className="hidden md:flex items-center gap-4 text-sm">
                <Link
                  href="/showcase"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Overview
                </Link>
                <Link
                  href="/showcase/components"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Components
                </Link>
                <Link
                  href="/showcase/forms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forms
                </Link>
                <Link
                  href="/showcase/charts"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Charts
                </Link>
                <Link
                  href="/showcase/calendars"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Calendars
                </Link>
                <Link
                  href="/showcase/playground"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Playground
                </Link>
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
