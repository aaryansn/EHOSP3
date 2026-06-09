"use client";

import { useState } from "react";
import { updateCmsPage } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { slug: string; title: string; content: string };

export function CmsEditor({ slug, title: initialTitle, content: initialContent }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [msg, setMsg] = useState("");

  async function handleSave() {
    try {
      await updateCmsPage(slug, title, content);
      setMsg("Saved!");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="capitalize">{slug}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
        <textarea
          className="min-h-32 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button onClick={handleSave}>Save</Button>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
      </CardContent>
    </Card>
  );
}
