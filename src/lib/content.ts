import { getCollection, type CollectionEntry } from "astro:content";
import { siteConfig } from "@/lib/site";

export type PostSummary = {
  slug: string;
  title: string;
  description: string;
  date: string;
};

export type Post = PostSummary & {
  body: string;
  bodyFormat: "mdx" | "html";
  canonicalUrl: string;
  keywords?: string[];
  author?: string;
  entry?: CollectionEntry<"blog">;
};

function normalizeSummary(record: {
  slug: string;
  title?: string;
  description?: string;
  publishedAt?: string;
  date?: string;
}): PostSummary {
  const date = record.publishedAt || record.date || new Date().toISOString();

  return {
    slug: record.slug,
    title: record.title || record.slug,
    description: record.description || "",
    date,
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
    });

    return {
      ...summary,
      body: "",
      bodyFormat: "mdx",
      canonicalUrl: `${siteConfig.url}/blog/${entry.id}`,
      keywords: entry.data.keywords,
      author: entry.data.author,
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
