import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"
import { getSupabase, isSupabaseConfigured, supabasePublicUrl } from "@/lib/supabase"

/**
 * Image upload abstraction layer.
 *
 * Two providers:
 *   1. SupabaseStorageProvider — production. Uploads to a Supabase Storage bucket
 *      and returns a public URL.
 *   2. LocalStorageProvider   — local dev / sandbox fallback. Writes to
 *      /public/uploads/* and returns a relative path.
 *
 * The provider is chosen automatically at runtime based on whether
 * NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
 */

export interface UploadResult {
  url: string // publicly accessible URL
  filename: string
  size: number
  mimetype: string
}

export interface ImageStorageProvider {
  upload(file: File, subdir?: string): Promise<UploadResult>
  delete(url: string): Promise<void>
}

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Validates the file's magic bytes (file signature) to ensure it's actually an image
 * and not a spoofed file with a manipulated extension or MIME type.
 */
function validateImageBytes(bytes: ArrayBuffer): boolean {
  if (bytes.byteLength < 12) return false;
  const arr = new Uint8Array(bytes);
  
  // JPEG: FF D8 FF
  if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) return true;
  
  // PNG: 89 50 4E 47
  if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47) return true;
  
  // GIF: GIF8
  if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38) return true;
  
  // WebP: RIFF....WEBP
  if (
    arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 && // RIFF
    arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50  // WEBP
  ) {
    return true;
  }

  return false;
}

// =====================================================================
// SUPABASE STORAGE PROVIDER
// =====================================================================

const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "club-assets"

class SupabaseStorageProvider implements ImageStorageProvider {
  async upload(file: File, subdir: string = "general"): Promise<UploadResult> {
    if (!ALLOWED_MIME.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Allowed: ${ALLOWED_MIME.join(", ")}`)
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error(`File too large: ${file.size} bytes (max ${MAX_SIZE_BYTES})`)
    }

    const bytes = await file.arrayBuffer()
    if (!validateImageBytes(bytes)) {
      throw new Error("Invalid file content: Magic byte verification failed. The file is not a valid image.")
    }

    const client = getSupabase()
    if (!client) throw new Error("Supabase client not initialised")

    // Allow only safe subdirs
    const safeSubdir = ["general", "profile", "blog", "team"].includes(subdir) ? subdir : "general"

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
    const random = crypto.randomBytes(12).toString("hex")
    const filename = `${Date.now()}-${random}.${ext}`
    const objectPath = `${safeSubdir}/${filename}`

    // Upload to Supabase Storage
    const { error } = await client
      .storage
      .from(SUPABASE_BUCKET)
      .upload(objectPath, Buffer.from(bytes), {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`)
    }

    // Build a public URL
    const { data: pub } = client
      .storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(objectPath)

    return {
      url: pub.publicUrl,
      filename,
      size: file.size,
      mimetype: file.type,
    }
  }

  async delete(url: string): Promise<void> {
    if (!url) return
    // Only attempt to delete URLs that point to our Supabase bucket
    const base = supabasePublicUrl()
    if (!base || !url.startsWith(base)) return

    // Extract the object path from the public URL
    // Format: {base}/storage/v1/object/public/{bucket}/{subdir}/{filename}
    const marker = `/object/public/${SUPABASE_BUCKET}/`
    const idx = url.indexOf(marker)
    if (idx === -1) return
    const objectPath = url.substring(idx + marker.length)

    const client = getSupabase()
    if (!client) return
    const { error } = await client.storage.from(SUPABASE_BUCKET).remove([objectPath])
    if (error) {
      console.warn(`[storage] failed to delete ${objectPath}:`, error.message)
    }
  }
}

// =====================================================================
// LOCAL FALLBACK PROVIDER (sandbox / dev without Supabase)
// =====================================================================

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./public/uploads"
const PUBLIC_PREFIX = "/uploads"

class LocalStorageProvider implements ImageStorageProvider {
  async upload(file: File, subdir: string = "general"): Promise<UploadResult> {
    if (!ALLOWED_MIME.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}. Allowed: ${ALLOWED_MIME.join(", ")}`)
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error(`File too large: ${file.size} bytes (max ${MAX_SIZE_BYTES})`)
    }

    const bytes = await file.arrayBuffer()
    if (!validateImageBytes(bytes)) {
      throw new Error("Invalid file content: Magic byte verification failed. The file is not a valid image.")
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase()
    const random = crypto.randomBytes(12).toString("hex")
    const filename = `${Date.now()}-${random}.${ext}`

    const targetDir = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      UPLOAD_DIR.replace("./public", "public"),
      subdir,
    )
    await fs.mkdir(targetDir, { recursive: true })
    const fullPath = path.join(targetDir, filename)

    await fs.writeFile(fullPath, Buffer.from(bytes))

    const url = `${PUBLIC_PREFIX}/${subdir}/${filename}`
    return {
      url,
      filename,
      size: file.size,
      mimetype: file.type,
    }
  }

  async delete(url: string): Promise<void> {
    if (!url.startsWith(PUBLIC_PREFIX)) {
      // External URL — nothing to delete.
      return
    }
    const fsPath = path.join(process.cwd(), "public", url.replace(PUBLIC_PREFIX, ""))
    try {
      await fs.unlink(fsPath)
    } catch {
      // ignore missing-file errors
    }
  }
}

// =====================================================================
// PROVIDER SELECTION
// =====================================================================

let _provider: ImageStorageProvider | null = null

export function getStorageProvider(): ImageStorageProvider {
  if (!_provider) {
    if (isSupabaseConfigured()) {
      _provider = new SupabaseStorageProvider()
    } else {
      _provider = new LocalStorageProvider()
    }
  }
  return _provider
}

export async function uploadImage(file: File, subdir = "general"): Promise<UploadResult> {
  return getStorageProvider().upload(file, subdir)
}

export async function deleteImage(url: string): Promise<void> {
  return getStorageProvider().delete(url)
}

/**
 * Sanitize a filename for safe storage.
 */
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

/**
 * Generate a slug from arbitrary text.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
