import React from "react";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { AlertTriangle } from "lucide-react";

export function DashboardError({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
