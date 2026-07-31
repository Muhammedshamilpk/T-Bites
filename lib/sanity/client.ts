import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r1clvwwn";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";
export const readToken = process.env.SANITY_API_READ_TOKEN;
export const writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Ensures immediate real-time updates for dashboard edits
  token: writeToken || readToken,
  perspective: "raw",
});

const builder = createImageUrlBuilder({
  projectId,
  dataset,
});

export function urlFor(source: any) {
  if (!source) return "";
  return builder.image(source).url();
}

/** Helper GROQ query executor with graceful fallback */
export async function sanityFetch<T>({
  query,
  params = {},
  fallback,
}: {
  query: string;
  params?: Record<string, any>;
  fallback: T;
}): Promise<T> {
  try {
    const data = await sanityClient.fetch<T>(query, params);
    return data || fallback;
  } catch (error) {
    console.warn("Sanity CMS notice:", error);
    return fallback;
  }
}
