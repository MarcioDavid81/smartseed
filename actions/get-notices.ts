"use server";

import { Notice } from "@/types";

export async function getNotices(): Promise<Notice[]> {
  const res = await fetch("https://smartseed.api-mdwebdeveloper.com/wp-json/wp/v2/notice?acf_format=standard&_fields=id,title,date,acf", {
    next: { revalidate: 60 }, // Cache por 60 segundos
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notices");
  }

  return res.json();
}

export async function getNoticeBySlug(params: { slug: string }): Promise<Notice | null> {
  const res = await fetch(`https://smartseed.api-mdwebdeveloper.com/wp-json/wp/v2/notice?acf_format=standard&_fields=id,title,date,acf&slug=${params.slug}`, {
    next: { revalidate: 60 }, // Cache por 60 segundos
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notice by slug");
  }

  const data = await res.json();

  if (!data.length) return null;

  return data[0];
}

export async function getUniqueCategories(): Promise<string[]> {
  const notices = await getNotices();
  const categories = notices.map(notice => notice.acf.category.name);
  const uniqueCategories = Array.from(new Set(categories));
  return uniqueCategories;
}