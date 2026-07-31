import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r1clvwwn";
export const defaultDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const dataset = defaultDataset;
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";
export const readToken = process.env.SANITY_API_READ_TOKEN;
export const writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

const clientCache = new Map<string, SanityClient>();

/**
 * Reusable Sanity Client Factory that returns a client for the given dataset.
 * Supports multi-tenant dynamic dataset targeting (e.g. production, restaurant_a, restaurant_b).
 */
export function getSanityClientForDataset(targetDataset?: string): SanityClient {
  const target = (targetDataset && targetDataset.trim().length > 0) ? targetDataset.trim() : defaultDataset;

  if (clientCache.has(target)) {
    return clientCache.get(target)!;
  }

  const client = createClient({
    projectId,
    dataset: target,
    apiVersion,
    useCdn: false,
    token: writeToken || readToken,
    perspective: "raw",
  });

  clientCache.set(target, client);
  return client;
}

/** Default global client (targets production dataset) */
export const sanityClient = getSanityClientForDataset(defaultDataset);

/** Dynamic image URL builder for a specific dataset */
export function urlFor(source: any, targetDataset?: string) {
  if (!source) return "";
  const target = targetDataset || defaultDataset;
  const builder = createImageUrlBuilder({
    projectId,
    dataset: target,
  });
  return builder.image(source).url();
}

/** Helper GROQ query executor with graceful fallback and dynamic dataset targeting */
export async function sanityFetch<T>({
  query,
  params = {},
  fallback,
  datasetName,
}: {
  query: string;
  params?: Record<string, any>;
  fallback: T;
  datasetName?: string;
}): Promise<T> {
  try {
    const client = getSanityClientForDataset(datasetName);
    const data = await client.fetch<T>(query, params);
    return data || fallback;
  } catch (error) {
    console.warn(`Sanity fetch notice [dataset: ${datasetName || defaultDataset}]:`, error);
    return fallback;
  }
}
