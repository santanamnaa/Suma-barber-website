"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type NavbarProps = {
  activeItem: string;
};

export default function Navbar({ activeItem }: NavbarProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    try {
      // Clear localStorage
      localStorage.removeItem("adminSession");
      
      // Show toast
      toast({
        title: "Berhasil Keluar",
        description: "Anda telah berhasil keluar dari sistem"
      });
      
      // Redirect to login
      router.push("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and brand */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold">Suma Barber Admin</h1>
          </div>
          
          {/* Desktop menu */}
          <nav className="hidden md:flex space-x-4">
            <Link 
              href="/admin/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeItem === "dashboard" 
                  ? "bg-gray-900 text-white" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/bookings"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeItem === "bookings" 
                  ? "bg-gray-900 text-white" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Bookings
            </Link>
            <Link 
              href="/admin/social-analytics"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                activeItem === "social-analytics" 
                  ? "bg-gray-900 text-white" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Social Analytics
            </Link>
          </nav>
          
          {/* Sign out button */}
          <div className="hidden md:flex items-center">
            <Button variant="outline" onClick={handleSignOut} className="flex items-center">
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-2 pb-4">
            <Link
              href="/admin/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                activeItem === "dashboard"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/bookings"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                activeItem === "bookings"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Bookings
            </Link>
            <Link
              href="/admin/social-analytics"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                activeItem === "social-analytics"
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Social Analytics
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center w-full mt-2 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </button>
          </div>
        )}
      </div>
    </header>
  );
}