import { createClient } from '@supabase/supabase-js';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType?: string,
) {
  try {
    // Try Supabase Storage first
    const { data, error } = await supabase.storage
      .from('costume-images')
      .upload(key, body, {
        contentType: contentType || getContentType(key),
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage failed, falling back to local storage:', error.message);
      return await uploadFileLocally(key, body);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('costume-images')
      .getPublicUrl(key);

    return publicUrl;
  } catch (error) {
    console.warn('Supabase storage error, falling back to local storage:', error);
    return await uploadFileLocally(key, body);
  }
}

async function uploadFileLocally(key: string, body: Buffer | Uint8Array | Blob | string) {
  // Create uploads directory if it doesn't exist
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });

  // Convert Blob to Buffer if needed
  let buffer: Buffer;
  if (body instanceof Blob) {
    const arrayBuffer = await body.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else if (typeof body === 'string') {
    buffer = Buffer.from(body, 'utf8');
  } else {
    buffer = Buffer.from(body);
  }

  // Save file locally
  const filePath = join(uploadsDir, key);
  await writeFile(filePath, buffer);

  // Return public URL
  return `/uploads/${key}`;
}

function getContentType(filename: string) {
  const ext = filename.toLowerCase().split('.').pop();
  const typeMap: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'webp': 'image/webp',
    'gif': 'image/gif',
  };
  return typeMap[ext || ''] || 'image/jpeg';
}
