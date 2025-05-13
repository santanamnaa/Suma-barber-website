"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Menu } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
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

        const sessionId = session.session_id;

        const { data: sessionData, error: sessionError } = await supabase
          .from("admin_sessions")
          .select("id, admin_id, expires_at")
          .eq("id", sessionId)
          .maybeSingle();

        if (sessionError || !sessionData) {
          router.push("/admin/login");
          setAuthenticated(false);
          setLoading(false);
          return;
        }

        const now = new Date();
        if (sessionData.expires_at && new Date(sessionData.expires_at) < now) {
          await supabase.from('admin_sessions').delete().eq('id', sessionId);
          localStorage.removeItem("adminSession");
          router.push("/admin/login");
          setAuthenticated(false);
          setLoading(false);
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push("/admin/login");
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  const handleSignOut = async () => {
    try {
      const adminSessionJSON = localStorage.getItem("adminSession");
      if (adminSessionJSON) {
        const session = JSON.parse(adminSessionJSON);
        await supabase.from('admin_sessions').delete().eq('id', session.session_id);
        localStorage.removeItem("adminSession");
      }

      toast({ title: "Signed out successfully" });
      router.push("/admin/login");
    } catch (error) {
      toast({ variant: "destructive", title: "Sign out failed" });
    }
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
    <div className="flex flex-col md:flex-row h-screen bg-black text-white">
      {/* Sidebar for desktop, drawer for mobile */}
      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center justify-between bg-gray-900 p-4 shadow-md">
        <h2 className="text-lg font-semibold">Suma Barber Admin</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Open sidebar">
          <Menu size={28} />
        </button>
      </div>
      {/* Sidebar Drawer (Mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-60 transition-opacity md:hidden ${sidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 shadow-lg transform transition-transform md:relative md:translate-x-0 md:block ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex items-center justify-between md:block">
          <h1 className="text-2xl font-bold">Suma Admin</h1>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
            ✕
          </button>
        </div>
        <nav className="mt-6">
          <ul>
            <li>
              <Link href="/admin/dashboard" className="block px-6 py-3 hover:bg-gray-700">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/dashboard/bookings" className="block px-6 py-3 hover:bg-gray-700">
                Bookings
              </Link>
            </li>
            <li>
              <Link href="/admin/dashboard/services" className="block px-6 py-3 hover:bg-gray-700">
                Services
              </Link>
            </li>
            <li>
              <Link href="/admin/dashboard/locations" className="block px-6 py-3 hover:bg-gray-700">
                Locations
              </Link>
            </li>
            <li>
              <Link href="/admin/dashboard/social" className="block px-6 py-3 hover:bg-gray-700">
                Social Analytics
              </Link>
            </li>
          </ul>
        </nav>
        <div className="absolute bottom-0 w-64 p-6">
          <Button variant="outline" className="w-full" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </aside>
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-black pt-0 md:pt-0">
        <header className="hidden md:block bg-gray-900 shadow-md p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Suma Barber Admin</h2>
          </div>
        </header>
        <main className="p-2 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
