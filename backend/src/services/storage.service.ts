import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { getEnv, type R2Bucket } from "../config/env";
import { getImageFromDb, deleteImageFromDb } from "../models/db";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function getLocalUploadPath(key: string): string {
  if (!key || basename(key) !== key) throw new Error("Invalid image key.");
  const uploadDirectory = resolve(process.env.UPLOAD_DIR || "uploads");
  const filePath = resolve(uploadDirectory, key);
  if (
    !filePath.startsWith(`${uploadDirectory}\\`) &&
    !filePath.startsWith(`${uploadDirectory}/`)
  ) {
    throw new Error("Invalid image key.");
  }
  return filePath;
}

function sanitizeFilename(filename: string): string {
  const clean = filename.toLowerCase().replace(/[^a-z0-9.-]/g, "-");
  return clean.slice(0, 50);
}

function getExtensionFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/svg+xml":
      return "svg";
    case "image/avif":
      return "avif";
    default:
      return "bin";
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function getStorage(): Promise<R2Bucket | null> {
  const env = await getEnv();
  return env.STORAGE || null;
}

export async function uploadImageToR2(
  fileBuffer: ArrayBuffer | Uint8Array,
  contentType: string,
  originalFilename?: string,
): Promise<{ url: string; key: string; size: number }> {
  const bytes =
    fileBuffer instanceof Uint8Array ? fileBuffer : new Uint8Array(fileBuffer);

  if (bytes.byteLength > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `Image exceeds maximum allowed size of 10MB (actual: ${(bytes.byteLength / (1024 * 1024)).toFixed(2)}MB).`,
    );
  }

  const mime = (contentType || "image/jpeg").toLowerCase().split(";")[0].trim();
  if (!ALLOWED_MIME_TYPES.has(mime)) {
    throw new Error(
      `Unsupported image type "${contentType}". Please upload a JPEG, PNG, WebP, GIF, SVG, or AVIF.`,
    );
  }

  const ext = getExtensionFromMime(mime);
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const safeName = originalFilename
    ? sanitizeFilename(originalFilename)
    : `image-${randomSuffix}.${ext}`;
  const key = `prg-${Date.now()}-${randomSuffix}-${safeName}`;

  const storage = await getStorage();
  if (storage) {
    try {
      await storage.put(key, bytes, {
        httpMetadata: {
          contentType: mime,
          cacheControl: "public, max-age=31536000, immutable",
        },
        customMetadata: {
          originalName: originalFilename || "",
          uploadedAt: new Date().toISOString(),
        },
      });
      return {
        url: `/api/images/${encodeURIComponent(key)}`,
        key,
        size: bytes.byteLength,
      };
    } catch (r2Err) {
      console.warn("R2 upload fallback to D1 database:", r2Err);
    }
  }

  const filePath = getLocalUploadPath(key);
  await mkdir(resolve(filePath, ".."), { recursive: true });
  await writeFile(filePath, bytes, { flag: "wx" });

  return {
    url: `/api/images/${encodeURIComponent(key)}`,
    key,
    size: bytes.byteLength,
  };
}

export async function getImageFromR2(key: string): Promise<{
  body: ReadableStream | Uint8Array;
  contentType: string;
  etag?: string;
  size?: number;
} | null> {
  const storage = await getStorage();
  if (storage) {
    try {
      const object = await storage.get(key);
      if (object) {
        return {
          body: object.body,
          contentType: object.httpMetadata?.contentType || "image/jpeg",
          etag: object.etag,
          size: object.size,
        };
      }
    } catch {
      // ignore
    }
  }

  try {
    const bytes = await readFile(getLocalUploadPath(key));
    const extension = key.split(".").pop()?.toLowerCase();
    const contentType =
      extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : extension === "gif"
            ? "image/gif"
            : extension === "svg"
              ? "image/svg+xml"
              : extension === "avif"
                ? "image/avif"
                : "image/jpeg";
    return {
      body: new Uint8Array(bytes),
      contentType,
      size: bytes.byteLength,
    };
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT"))
      throw error;
  }

  const dbImage = await getImageFromDb(key);
  if (dbImage) {
    const bytes = base64ToUint8Array(dbImage.data);
    return {
      body: bytes,
      contentType: dbImage.contentType,
      size: dbImage.size,
    };
  }

  return null;
}

export async function deleteImageFromR2(key: string): Promise<boolean> {
  const storage = await getStorage();
  if (storage) {
    try {
      await storage.delete(key);
    } catch {
      // ignore
    }
  }
  try {
    await unlink(getLocalUploadPath(key));
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT"))
      throw error;
  }
  await deleteImageFromDb(key);
  return true;
}
