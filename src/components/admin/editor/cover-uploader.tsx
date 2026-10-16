"use client";

import { ImageUp, RefreshCw, Trash2 } from "lucide-react";
import { useRef, useState, type ComponentProps, type DragEvent } from "react";
import { useAdminServices } from "@/components/admin/shell/admin-auth-provider";
import { CoverImage } from "@/components/articles/cover-image";
import { Spinner } from "@/components/ui/spinner";
import { IMAGE_UPLOAD_RULES } from "@/core/media/image-uploader";
import { useI18n } from "@/i18n/i18n-provider";
import { cn } from "@/lib/cn";
import { describeUploadError } from "./image-errors";

interface CoverUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  error?: string;
}

/** Click or drag-and-drop a cover image; shows a preview once uploaded. */
export function CoverUploader({ value, onChange, error }: CoverUploaderProps) {
  const { dict } = useI18n();
  const t = dict.admin.editor;
  const { images } = useAdminServices();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      onChange(await images.upload(file, "covers"));
    } catch (failure) {
      setUploadError(describeUploadError(failure, dict));
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void upload(file);
  }

  const message = uploadError ?? error;

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "relative aspect-[21/9] overflow-hidden rounded-3xl border-2 border-dashed transition",
          dragging ? "border-moss bg-moss/10" : "border-forest/15 bg-white/60",
          message && "border-rose-deep",
        )}
      >
        {value ? (
          <>
            <CoverImage src={value} alt="" sizes="(min-width: 1024px) 720px, 100vw" />
            <div className="absolute right-3 bottom-3 flex gap-2">
              <OverlayButton onClick={() => input.current?.click()} disabled={uploading}>
                {uploading ? <Spinner /> : <RefreshCw className="size-4" aria-hidden />}
                {t.coverChange}
              </OverlayButton>
              <OverlayButton onClick={() => onChange(null)} disabled={uploading}>
                <Trash2 className="size-4" aria-hidden />
                {t.coverRemove}
              </OverlayButton>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={uploading}
            className="flex size-full flex-col items-center justify-center gap-2 text-forest"
          >
            {uploading ? (
              <Spinner className="size-7" />
            ) : (
              <ImageUp className="size-9 text-moss" aria-hidden />
            )}
            <span className="font-bold">{uploading ? t.uploading : t.coverPick}</span>
            <span className="text-xs text-ink/55">{t.coverHint}</span>
          </button>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept={IMAGE_UPLOAD_RULES.acceptedTypes.join(",")}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = "";
        }}
      />
      {message && (
        <p role="alert" className="mt-1.5 text-sm font-semibold text-rose-deep">
          {message}
        </p>
      )}
    </div>
  );
}

function OverlayButton(props: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className="inline-flex h-9 items-center gap-2 rounded-full bg-cream/90 px-3 text-sm font-bold text-forest shadow backdrop-blur transition hover:bg-white disabled:opacity-60"
      {...props}
    />
  );
}
