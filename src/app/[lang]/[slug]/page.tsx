import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchGraphQL } from "@/lib/graphql";
import { truncateText } from "@/lib/formatters";
import { sanitizeHtml } from "@/lib/sanitize";
import ScriptExecutor from "@/app/components/ScriptExecutor";

interface PageProps {
  params: Promise<{ slug: string; lang: string }>;
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
  const { slug, lang } = await params;
  const decodedSlug = decodeURIComponent(slug);

  try {
    const { data } = await fetchGraphQL(GET_PAGE_BY_SLUG_QUERY, { id: decodedSlug }, undefined, { revalidate: 60, language: lang?.toUpperCase() });
    const page = data?.page;

    if (!page) {
      return {
        title: "الصفحة غير موجودة | سحبة فيب",
        description: "عذراً، هذه الصفحة غير متوفرة حالياً.",
      };
    }

    const title = `${page.title} | سحبة فيب`;
    const cleanDesc = page.content ? truncateText(page.content, 160) : "";
    const description = cleanDesc || `عرض صفحة ${page.title} ومحتوياتها.`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sahbavape.com";
    const canonicalUrl = `${siteUrl}/${decodedSlug}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "سحبة فيب",
        locale: "ar_KW",
        images: [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
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
  const { slug, lang } = resolvedParams;
  const decodedSlug = decodeURIComponent(slug);

  let page = null;
  try {
    const { data } = await fetchGraphQL(GET_PAGE_BY_SLUG_QUERY, { id: decodedSlug }, undefined, { revalidate: 60, language: lang?.toUpperCase() });
    page = data?.page;
  } catch (error) {
    console.error("[StaticPage] Error fetching page:", error);
  }

  if (!page) {
    notFound();
  }

  const scopedContent = sanitizeAndScopeHtml(page.content || "");

  return (
    <main className="static-page-container container">
      <div className="static-page-wrapper">
        <h1 className="static-page-title">{page.title}</h1>
        <div 
          className="wp-content"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(scopedContent) }}
        />
        <ScriptExecutor contentHtml={scopedContent} />
      </div>
    </main>
  );
}
