"use client";

import { useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  bucket: "food-images" | "restaurant-logos" | "restaurant-banners";
  pathPrefix: string;
  onUploadComplete: (publicUrl: string, storagePath: string) => void;
  currentImageUrl?: string | null;
  label?: string;
}

export function ImageUpload({
  bucket,
  pathPrefix,
  onUploadComplete,
  currentImageUrl,
  label = "Upload Image",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be under 5MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const filePath = `${pathPrefix}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      setPreview(publicUrl);
      onUploadComplete(publicUrl, filePath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-border group bg-surface">
          <img
            src={preview}
            alt="Upload preview"
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <label className="px-3 py-1.5 rounded-xl bg-white/90 text-foreground text-xs font-semibold cursor-pointer hover:bg-white transition-colors">
              Change
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onUploadComplete("", "");
              }}
              className="p-1.5 rounded-xl bg-error text-white hover:bg-error/90 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-40 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-surface/50 hover:bg-surface transition-all cursor-pointer">
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-foreground-muted">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-foreground-muted p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                Click to upload image
              </span>
              <span className="text-[11px] text-foreground-muted">
                PNG, JPG, WebP up to 5MB
              </span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}
