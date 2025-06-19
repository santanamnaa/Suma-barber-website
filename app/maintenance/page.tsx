import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center py-12 px-4 bg-background">
      <Card className="w-full max-w-md shadow-xl border bg-card/80 backdrop-blur-md">
        <CardHeader className="flex flex-col items-center gap-4">
          <div className="mb-2">
            {/* Modern Illustration: Gear with wrench */}
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="drop-shadow-xl">
              <circle cx="12" cy="12" r="10" fill="currentColor" className="text-muted" />
              <path d="M15.5 13.5l2.5 2.5M16.5 9.5a4 4 0 11-5-5l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"/>
              <path d="M12 8v4l3 2" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Under Maintenance</CardTitle>
          <CardDescription className="text-center">
            Maaf, halaman ini sedang dalam perbaikan.<br />Silakan kembali lagi nanti.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <span className="inline-block rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 px-3 py-1 text-xs font-semibold mb-4">Scheduled Maintenance</span>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 