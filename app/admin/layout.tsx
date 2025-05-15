"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { Menu } from "lucide-react";

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

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }
  if (!authenticated) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white text-black font-sans">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between bg-black p-4 shadow-md">
        <h2 className="text-lg font-semibold text-white">Suma Barber Admin</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Open sidebar" className="text-white">
          <Menu size={28} />
        </button>
      </div>
      {/* Sidebar Drawer (Mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-60 transition-opacity md:hidden ${sidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-black shadow-lg transform transition-transform md:relative md:translate-x-0 md:block ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex items-center justify-between md:block">
          <h1 className="text-2xl font-bold text-white tracking-wide">Suma Admin</h1>
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            ✕
          </button>
        </div>
        <nav className="mt-6">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href} className="mb-1">
                <Link
                  href={link.href}
                  className={`block px-6 py-3 rounded-lg transition-colors font-medium text-sm ${pathname === link.href ? "bg-white text-black shadow font-bold" : "text-white hover:bg-gray-800"}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-6">
          <Button variant="outline" className="w-full border-white text-white hover:bg-gray-800 hover:text-white" onClick={handleSignOut}>
            Keluar
          </Button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-white pt-0 md:pt-0">
        <header className="hidden md:block bg-black shadow-md p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white tracking-wide">Suma Barber Admin</h2>
          </div>
        </header>
        <main className="p-2 sm:p-6 md:p-10 bg-white min-h-screen">{children}</main>
      </div>
    </div>
  );
} 