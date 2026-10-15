import type { ImageUploader } from "@/core/media/image-uploader";

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.8;

/**
 * Demo-only uploader: shrinks the image in the browser and returns it as a
 * data URL, so it can be stored in the demo store and shown on public pages
 * without any image hosting.
 */
export class DataUrlImageUploader implements ImageUploader {
  async upload(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  }
}
