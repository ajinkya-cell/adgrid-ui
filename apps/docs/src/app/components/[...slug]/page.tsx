import { redirect } from "next/navigation";
import { registry } from "@/registry";

export default async function ComponentsCatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    redirect("/gallery");
  }

  const lastSlug = slug[slug.length - 1];
  const firstSlug = slug[0];

  const entry =
    registry.find((c) => c.slug === lastSlug) ||
    registry.find((c) => c.slug === firstSlug);

  if (entry) {
    redirect(`/present/${entry.category}/${entry.slug}`);
  }

  redirect("/gallery");
}
