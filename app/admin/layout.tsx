"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { Menu, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/dashboard/bookings", label: "Booking" },
  { href: "/admin/dashboard/services", label: "Layanan" },
  { href: "/admin/dashboard/locations", label: "Lokasi" },
  { href: "/admin/dashboard/location-services", label: "Layanan di Lokasi" },
  { href: "/admin/dashboard/admins", label: "Admin" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Simple session check (can be improved)
    const adminSessionJSON = localStorage.getItem("adminSession");
    if (!adminSessionJSON) {
      router.push("/admin/login");
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    const session = JSON.parse(adminSessionJSON);
    if (!session || !session.loggedIn) {
      router.push("/admin/login");
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    setAuthenticated(true);
    setLoading(false);
  }, [router, pathname]);

  const handleSignOut = async () => {
    localStorage.removeItem("adminSession");
    router.push("/admin/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <p>Loading...</p>
      </div>
    );
  }
  if (!authenticated) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background text-foreground font-sans">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-background border-b p-4">
        <h2 className="text-lg font-semibold">Suma Barber Admin</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Open sidebar">
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Sidebar Drawer (Mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r shadow-lg transform transition-transform md:relative md:translate-x-0 md:block ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between md:block">
          <h1 className="text-2xl font-bold tracking-wide">Suma Admin</h1>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            ✕
          </button>
        </div>
        <nav className="mt-6">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href} className="mb-1">
                <Link
                  href={link.href}
                  className={`block px-6 py-3 rounded-lg transition-colors font-medium text-sm ${
                    pathname === link.href
                      ? "bg-primary text-primary-foreground shadow font-bold"
                      : "text-foreground hover:bg-accent"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-6 space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            Keluar
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-background pt-0 md:pt-0">
        <header className="hidden md:flex bg-card border-b shadow-sm p-4 justify-between items-center">
          <h2 className="text-xl font-semibold tracking-wide">Suma Barber Admin</h2>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>
        <main className="p-2 sm:p-6 md:p-10 min-h-screen">{children}</main>
      </div>
    </div>
  );
}