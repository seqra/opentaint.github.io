import { getCollection, type CollectionEntry } from "astro:content";
import { siteConfig } from "@/lib/site";

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updatedDate?: string;
  contentType: "Guide" | "Benchmark" | "Case study" | "Technical note";
};

export type Post = PostSummary & {
  body: string;
  bodyFormat: "mdx" | "html";
  canonicalUrl: string;
  keywords?: string[];
  author?: string;
  faqs?: { question: string; answer: string }[];
  entry?: CollectionEntry<"blog">;
};

function normalizeSummary(record: {
  slug: string;
  title?: string;
  description?: string;
  publishedAt?: string;
  date?: string;
  updatedDate?: string;
  contentType?: PostSummary["contentType"];
}): PostSummary {
  const date = record.publishedAt || record.date || new Date().toISOString();

  return {
    slug: record.slug,
    title: record.title || record.slug,
    description: record.description || "",
    date,
    updatedDate: record.updatedDate,
    contentType: record.contentType || "Technical note",
  };
}

async function getLocalPosts(): Promise<Post[]> {
  const entries = await getCollection("blog");

  const posts: Post[] = entries.map((entry) => {
    const summary = normalizeSummary({
      slug: entry.id,
      title: entry.data.title,
      description: entry.data.description,
      date: entry.data.date,
      updatedDate: entry.data.updatedDate,
      contentType: entry.data.contentType,
    });

    return {
      ...summary,
      body: "",
      bodyFormat: "mdx",
      canonicalUrl: `${siteConfig.url}/blog/${entry.id}/`,
      keywords: entry.data.keywords,
      author: entry.data.author,
      faqs: entry.data.faqs,
      entry,
    } satisfies Post;
  });

  return posts.sort(
    (left, right) =>
      new Date(right.date).getTime() - new Date(left.date).getTime(),
  );
}

export async function getPosts(): Promise<Post[]> {
  return getLocalPosts();
}

export async function getPostSummaries(): Promise<PostSummary[]> {
  const posts = await getPosts();
  return posts.map(
    ({ body: _body, bodyFormat: _bodyFormat, canonicalUrl: _canonicalUrl, entry: _entry, ...post }) =>
      post,
  );
}
