"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Email dan password harus diisi");
      setLoading(false);
      return;
    }

    try {
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select()
        .eq("email", email)
        .maybeSingle();

      if (adminError) {
        setErrorMessage("Terjadi kesalahan saat memeriksa data admin: " + adminError.message);
        return;
      }

      if (!adminData) {
        setErrorMessage("Email tidak ditemukan. Periksa kembali email Anda.");
        return;
      }

      if (adminData.password !== password) {
        setErrorMessage("Password salah. Silakan coba lagi.");
        return;
      }

      // Create session
      const { data: sessionData, error: sessionError } = await supabase
        .from("admin_sessions")
        .insert({
          admin_id: adminData.id,
          email: adminData.email,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .maybeSingle();

      if (sessionError || !sessionData) {
        setErrorMessage("Gagal membuat sesi login.");
        return;
      }

      localStorage.setItem("adminSession", JSON.stringify({
        email: adminData.email,
        id: adminData.id,
        session_id: sessionData.id,
        loggedIn: true,
        timestamp: new Date().getTime()
      }));

      toast({
        title: "Login berhasil",
        description: "Selamat datang di dashboard admin",
      });

      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 1000);

    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Card className="w-full max-w-md bg-gray-900 text-white shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Suma Barber Admin</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Masukkan kredensial Anda untuk mengakses dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertTitle>Login Gagal</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                className="bg-gray-800 border-gray-700 text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sedang login..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
