import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';

function getBucket() {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new Error('Database is not connected');
  }
  return new GridFSBucket(mongoose.connection.db, { bucketName: 'secureShareDocs' });
}

/** Store an already-encrypted buffer. Content type is deliberately generic. */
export function storeEncryptedFile(buffer) {
  const bucket = getBucket();
  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream('encrypted.bin', {
      contentType: 'application/octet-stream',
      metadata: { kind: 'secure-share', encrypted: true },
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

export function readEncryptedFile(fileId) {
  const bucket = getBucket();
  const id = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = bucket.openDownloadStream(id);
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

export async function deleteStoredFile(fileId) {
  if (!fileId) return;
  try {
    const bucket = getBucket();
    const id = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
    await bucket.delete(id);
  } catch (err) {
    if (err?.code !== 'ENOENT' && err?.message !== 'FileNotFound') {
      console.error('[secureShareFiles] delete failed', err.message);
    }
  }
}
