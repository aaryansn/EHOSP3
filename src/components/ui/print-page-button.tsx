"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useCallback } from "react";

export function PrintPageButton({ label = "Print / Save as PDF" }: { label?: string }) {
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <Button type="button" variant="outline" onClick={handlePrint}>
      <Printer className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
