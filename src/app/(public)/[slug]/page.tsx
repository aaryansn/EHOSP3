import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const CMS_SLUGS = ["terms", "privacy", "refund-policy", "faq", "about"] as const;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return CMS_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("cms_pages").select("title").eq("slug", slug).single();
  return { title: data?.title ?? slug };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  if (!CMS_SLUGS.includes(slug as (typeof CMS_SLUGS)[number])) notFound();

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("cms_pages")
    .select("title, content")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!page) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 prose prose-slate sm:px-6">
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </article>
  );
}
