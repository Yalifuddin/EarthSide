import { ImageRejectedError } from "@/core/media/image-uploader";
import type { Dictionary } from "@/i18n/dictionaries/id";

/** Maps an upload failure to a friendly, translated message. */
export function describeUploadError(error: unknown, dict: Dictionary): string {
  const t = dict.admin.editor;
  if (error instanceof ImageRejectedError) {
    return error.reason === "too_large" ? t.imageTooLarge : t.imageUnsupported;
  }
  return t.uploadFailed;
}
