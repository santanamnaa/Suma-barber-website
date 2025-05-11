"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

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
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Suma Admin</h1>
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
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-black">
        <header className="bg-gray-900 shadow-md p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Suma Barber Admin</h2>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
