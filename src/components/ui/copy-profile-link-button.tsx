"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type CopyProfileLinkButtonProps = {
  doctorId: string;
  label?: string;
};

export function CopyProfileLinkButton({ doctorId, label = "Copy profile link" }: CopyProfileLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLink(`${window.location.origin}/doctors/${doctorId}`);
    }
  }, [doctorId]);

  async function handleCopy() {
    try {
      if (link) {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleCopy}>
      {copied ? "Link copied" : label}
    </Button>
  );
}
