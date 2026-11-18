import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

export const MAX_FILE_BYTES = 4 * 1024 * 1024;

export const ALLOWED_MIME = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

function getBucket() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new Error('Database is not connected');
  }
  return new GridFSBucket(mongoose.connection.db, { bucketName: 'proposalDocs' });
}

export function decodeUploadedFile({ contentBase64, fileName, fileMime }) {
  if (!contentBase64 || !fileName) {
    throw new Error('A file is required');
  }
  const mime = String(fileMime || '').split(';')[0].trim().toLowerCase();
  if (!ALLOWED_MIME[mime]) {
    throw new Error('Send a PDF or image (PNG, JPG, WebP, GIF)');
  }
  const raw = String(contentBase64).replace(/^data:[^;]+;base64,/, '');
  const buffer = Buffer.from(raw, 'base64');
  if (!buffer.length) throw new Error('The file could not be read');
  if (buffer.length > MAX_FILE_BYTES) {
    throw new Error('File must be 4 MB or smaller');
  }
  const safeName = String(fileName).replace(/[^\w.\- ()]/g, '_').slice(0, 160);
  return { buffer, fileName: safeName || `document.${ALLOWED_MIME[mime]}`, fileMime: mime };
}

export function uploadProposalFile({ buffer, fileName, fileMime }) {
  const bucket = getBucket();
  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(fileName, {
      contentType: fileMime,
      metadata: { kind: 'proposal-document' },
    });
    let settled = false;
    const finish = (err, id) => {
      if (settled) return;
      settled = true;
      if (err) reject(err);
      else resolve(id);
    };
    stream.on('error', (err) => finish(err));
    stream.on('finish', () => finish(null, stream.id));
    stream.on('close', () => finish(null, stream.id));
    stream.end(buffer);
    setTimeout(() => finish(new Error('File upload timed out')), 20000);
  });
}

export function openProposalFileStream(fileId) {
  const bucket = getBucket();
  const id = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  return bucket.openDownloadStream(id);
}

export async function deleteProposalFile(fileId) {
  if (!fileId) return;
  try {
    const bucket = getBucket();
    const id = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
    await bucket.delete(id);
  } catch (err) {
    if (err?.code !== 'ENOENT' && err?.message !== 'FileNotFound') {
      console.error('[proposalFiles] delete failed', err.message);
    }
  }
}
