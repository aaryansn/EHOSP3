import { createClient } from "@/lib/supabase/server";
import { CmsEditor } from "@/components/admin/cms-editor";

export default async function AdminCmsPage() {
  const supabase = await createClient();
  const { data: pages } = await supabase.from("cms_pages").select("slug, title, content").order("slug");

  return (
    <div>
      <h1 className="text-2xl font-bold">CMS — Edit Pages</h1>
      <p className="mt-1 text-slate-500">Update legal and info pages without redeploying.</p>
      <div className="mt-8 space-y-8">
        {(pages ?? []).map((page) => (
          <CmsEditor key={page.slug} slug={page.slug} title={page.title} content={page.content} />
        ))}
      </div>
    </div>
  );
}
