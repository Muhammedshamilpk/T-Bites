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
 * Uses public client by default for read queries, and authenticated client for write operations.
 */
export function getSanityClientForDataset(targetDataset?: string, useAuthToken = false): SanityClient {
  const target = (targetDataset && targetDataset.trim().length > 0) ? targetDataset.trim() : defaultDataset;
  const cacheKey = `${target}_${useAuthToken ? "auth" : "public"}`;

  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  const activeToken = (writeToken && writeToken.trim().length > 0)
    ? writeToken.trim()
    : ((readToken && readToken.trim().length > 0) ? readToken.trim() : undefined);

  const client = createClient({
    projectId,
    dataset: target,
    apiVersion,
    useCdn: false,
    ...(useAuthToken && activeToken ? { token: activeToken } : {}),
    perspective: "published",
  });

  clientCache.set(cacheKey, client);
  return client;
}

/** Default global client (targets production dataset with auth for server operations) */
export const sanityClient = getSanityClientForDataset(defaultDataset, true);

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
    // Try public query first for maximum reliability across hosts
    const publicClient = getSanityClientForDataset(datasetName, false);
    const data = await publicClient.fetch<T>(query, params);
    return data ?? fallback;
  } catch (error) {
    // Try auth client if public query is restricted
    try {
      const authClient = getSanityClientForDataset(datasetName, true);
      const authData = await authClient.fetch<T>(query, params);
      return authData ?? fallback;
    } catch (authError) {
      console.warn(`Sanity fetch notice [dataset: ${datasetName || defaultDataset}]:`, authError);
      return fallback;
    }
  }
}
