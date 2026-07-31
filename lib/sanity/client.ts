import { createClient, type SanityClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "r1clvwwn";
export const defaultDataset = "production";
export const dataset = defaultDataset;
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";
export const readToken = process.env.SANITY_API_READ_TOKEN;
export const writeToken = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

const activeToken = (writeToken && writeToken.trim().length > 0)
  ? writeToken.trim()
  : ((readToken && readToken.trim().length > 0) ? readToken.trim() : undefined);

/** Unauthenticated Sanity Client for public GROQ queries */
export const publicSanityClient: SanityClient = createClient({
  projectId,
  dataset: defaultDataset,
  apiVersion,
  useCdn: false,
  perspective: "published",
});

/** Authenticated Sanity Client for mutations and server actions */
export const sanityClient: SanityClient = createClient({
  projectId,
  dataset: defaultDataset,
  apiVersion,
  useCdn: false,
  ...(activeToken ? { token: activeToken } : {}),
  perspective: "published",
});

/** Backward-compatible helper that returns the single production dataset client */
export function getSanityClientForDataset(_targetDataset?: string, useAuthToken = true): SanityClient {
  return useAuthToken ? sanityClient : publicSanityClient;
}

/** Image URL builder for production dataset */
const imageBuilder = createImageUrlBuilder({
  projectId,
  dataset: defaultDataset,
});

export function urlFor(source: any, _targetDataset?: string) {
  if (!source) return "";
  return imageBuilder.image(source).url();
}

/** Single-dataset GROQ query executor with graceful fallback */
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
    const data = await publicSanityClient.fetch<T>(query, params);
    return data ?? fallback;
  } catch (error) {
    try {
      const authData = await sanityClient.fetch<T>(query, params);
      return authData ?? fallback;
    } catch (authError) {
      console.warn(`Sanity fetch notice [dataset: ${datasetName || defaultDataset}]:`, authError);
      return fallback;
    }
  }
}
