import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { buildPostImage, renderOgImage, ogResponse } from "@/lib/og";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("blog");
  return posts.map((post) => ({
    params: { slug: post.id },
    props: {
      title: post.data.title,
      date: post.data.date,
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, date } = props as {
    title: string;
    date: string;
  };

  const png = await renderOgImage(buildPostImage(title, date));
  return ogResponse(png);
};
