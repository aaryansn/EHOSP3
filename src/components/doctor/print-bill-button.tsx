"use client";

import { Button } from "@/components/ui/button";

export function PrintBillButton() {
  return (
    <Button onClick={() => window.print()}>Print / Save as PDF</Button>
  );
}
