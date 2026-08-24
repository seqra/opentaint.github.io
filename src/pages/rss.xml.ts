import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getPostSummaries } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export async function GET(context: APIContext) {
  const posts = await getPostSummaries();

  return rss({
    title: `${siteConfig.title} Research`,
    description: "Application-security guides, benchmarks, case studies, and technical research from OpenTaint.",
    site: context.site ?? siteConfig.url,
    items: posts.map((post) => ({
      title: post.title,
      description: post.description,
      pubDate: new Date(post.date),
      link: `/blog/${post.slug}/`,
    })),
  });
}
