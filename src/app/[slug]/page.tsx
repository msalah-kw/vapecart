import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchGraphQL } from "@/lib/graphql";
import ScriptExecutor from "@/app/components/ScriptExecutor";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const GET_PAGE_BY_SLUG_QUERY = `
  query GetPageBySlug($id: ID!) {
    page(id: $id, idType: URI) {
      title
      content
    }
  }
`;

// Helper to sanitize WordPress content and scope the styles
function sanitizeAndScopeHtml(content: string): string {
  if (!content) return "";
  
  if (content.includes("<body") || content.includes("<BODY")) {
    return content
      .replace(/<body[^>]*>/i, '<div class="wordpress-page-content">')
      .replace(/<\/body>/i, '</div>')
      .replace(/body\s*{/gi, '.wordpress-page-content {')
      .replace(/html,?\s*body\s*{/gi, '.wordpress-page-content {')
      .replace(/<!DOCTYPE html>/i, '')
      .replace(/<html[^>]*>/i, '')
      .replace(/<\/html>/i, '')
      .replace(/<head[^>]*>([\s\S]*?)<\/head>/i, (match, p1) => {
        const styleMatches = p1.match(/<style[\s\S]*?<\/style>/gi);
        return styleMatches ? styleMatches.join('\n') : '';
      });
  }
  
  return `<div class="wordpress-page-content">${content}</div>`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const { data } = await fetchGraphQL(GET_PAGE_BY_SLUG_QUERY, { id: decodedSlug }, undefined, { revalidate: 60 });
    const page = data?.page;

    if (!page) {
      return {
        title: "الصفحة غير موجودة | سحبة فيب",
        description: "عذراً، هذه الصفحة غير متوفرة حالياً.",
      };
    }

    const title = `${page.title} | سحبة فيب`;
    const description = `عرض صفحة ${page.title} ومحتوياتها.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [],
      },
    };
  } catch (error) {
    return {
      title: "صفحة | سحبة فيب",
      description: "عرض محتويات الصفحة.",
    };
  }
}

export default async function StaticPage({ params }: PageProps) {
  const resolvedParams = await params;
  console.log("[StaticPage] ➤ Raw params:", JSON.stringify(resolvedParams));
  const { slug } = resolvedParams;
  const decodedSlug = decodeURIComponent(slug);
  console.log("[StaticPage] ➤ Decoded slug:", decodedSlug);

  let page = null;
  try {
    const { data } = await fetchGraphQL(GET_PAGE_BY_SLUG_QUERY, { id: decodedSlug }, undefined, { revalidate: 60 });
    console.log("[StaticPage] ➤ Raw data received:", JSON.stringify(data)?.substring(0, 500));
    page = data?.page;
  } catch (error) {
    console.error("[StaticPage] ✖ Error fetching page details:", error);
  }

  if (!page) {
    console.warn("[StaticPage] ⚠ page is null/undefined for slug:", decodedSlug, "→ calling notFound()");
    notFound();
  }

  const scopedContent = sanitizeAndScopeHtml(page.content || "");

  return (
    <main className="static-page-container container">
      <div className="static-page-wrapper">
        <h1 className="static-page-title">{page.title}</h1>
        <div 
          className="static-page-content"
          dangerouslySetInnerHTML={{ __html: scopedContent }}
        />
        <ScriptExecutor contentHtml={scopedContent} />
      </div>
    </main>
  );
}
