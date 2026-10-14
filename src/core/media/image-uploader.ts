export const IMAGE_UPLOAD_RULES = {
  maxBytes: 5 * 1024 * 1024,
  acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
} as const;

export type ImageRejectionReason = "too_large" | "unsupported_type";

export class ImageRejectedError extends Error {
  constructor(public readonly reason: ImageRejectionReason) {
    super(`Image rejected: ${reason}`);
    this.name = "ImageRejectedError";
  }
}

/** Port for storing an image somewhere public and returning its URL. */
export interface ImageUploader {
  upload(file: File, folder: string): Promise<string>;
}

export function assertUploadableImage(file: File): void {
  if (!(IMAGE_UPLOAD_RULES.acceptedTypes as readonly string[]).includes(file.type)) {
    throw new ImageRejectedError("unsupported_type");
  }
  if (file.size > IMAGE_UPLOAD_RULES.maxBytes) {
    throw new ImageRejectedError("too_large");
  }
}

/**
 * Decorator that validates files before delegating to any uploader, so every
 * storage backend gets the same rules without duplicating them.
 */
export class ValidatingImageUploader implements ImageUploader {
  constructor(private readonly inner: ImageUploader) {}

  upload(file: File, folder: string): Promise<string> {
    assertUploadableImage(file);
    return this.inner.upload(file, folder);
  }
}
