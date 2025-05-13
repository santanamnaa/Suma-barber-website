"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className={`relative flex min-h-screen flex-col ${inter.className} bg-background`}>
        {!isAdmin && <Navbar />}
        <main className={isAdmin ? "flex-1" : "flex-1 pt-16 md:pt-20"}>{children}</main>
        {!isAdmin && <Footer />}
      </div>
    </ThemeProvider>
  );
} 