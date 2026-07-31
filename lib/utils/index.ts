import { type ClassValue, clsx } from "clsx";

/**
 * Merge class names with clsx (handles conditional classes).
 * If you later add tailwind-merge, swap this implementation.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format a number as Indian Rupee currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date string to a human-readable form.
 */
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(new Date(dateStr));
}

/**
 * Format a relative time (e.g., "2 minutes ago").
 */
export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr, { dateStyle: "short" });
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Truncate a string to a max length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Day-of-week labels (0=Sunday).
 */
export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * Order status display configuration.
 */
export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; step: number }
> = {
  placed: { label: "Order Placed", color: "info", step: 1 },
  accepted: { label: "Accepted", color: "success", step: 2 },
  rejected: { label: "Rejected", color: "error", step: -1 },
  preparing: { label: "Preparing", color: "warning", step: 3 },
  out_for_delivery: { label: "Out for Delivery", color: "primary", step: 4 },
  delivered: { label: "Delivered", color: "success", step: 5 },
  cancelled: { label: "Cancelled", color: "error", step: -1 },
};
