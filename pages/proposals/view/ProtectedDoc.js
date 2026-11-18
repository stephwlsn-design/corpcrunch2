import { useEffect, useRef, useState } from 'react';
import styles from './View.module.css';

async function loadPdfjs() {
  const href = `${window.location.origin}/pdf.min.mjs`;
  const mod = await import(/* webpackIgnore: true */ href);
  const lib = mod.default || mod;
  lib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs`;
  return lib;
}

function copyBytes(buffer) {
  const src = new Uint8Array(buffer);
  const out = new Uint8Array(src.byteLength);
  out.set(src);
  return out;
}

export default function ProtectedDoc({ fileBlob, fileMime, onRendered }) {
  const hostRef = useRef(null);
  const onRenderedRef = useRef(onRendered);
  onRenderedRef.current = onRendered;
  const [pages, setPages] = useState(0);
  const [failed, setFailed] = useState('');

  useEffect(() => {
    if (!fileBlob) return undefined;
    let cancelled = false;
    const mime = String(fileMime || fileBlob.type || '').toLowerCase();

    const paintImage = async () => {
      const url = URL.createObjectURL(fileBlob);
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxW = Math.min(1100, img.naturalWidth || 1100);
          const scale = maxW / (img.naturalWidth || maxW);
          canvas.width = maxW;
          canvas.height = Math.round((img.naturalHeight || maxW) * scale);
          canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.dataset.section = 'page-1';
          URL.revokeObjectURL(url);
          if (!cancelled && hostRef.current) {
            hostRef.current.replaceChildren(canvas);
            setPages(1);
            onRenderedRef.current?.(hostRef.current, 1);
          }
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });
    };

    const paintPdf = async () => {
      const lib = await loadPdfjs();
      const data = copyBytes(await fileBlob.arrayBuffer());
      const task = lib.getDocument({
        data,
        disableRange: true,
        disableStream: true,
        isEvalSupported: false,
        useSystemFonts: true,
      });
      const doc = await task.promise;
      if (cancelled) {
        doc.destroy?.();
        return;
      }
      const wrap = document.createElement('div');
      wrap.className = styles.canvasStack;
      const maxPages = Math.min(doc.numPages || 1, 80);
      for (let i = 1; i <= maxPages; i += 1) {
        const page = await doc.getPage(i);
        const unscaled = page.getViewport({ scale: 1 });
        const scale = Math.min(1.35, 1000 / unscaled.width);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.dataset.section = `page-${i}`;
        await page.render({
          canvasContext: canvas.getContext('2d', { alpha: false }),
          viewport,
        }).promise;
        wrap.appendChild(canvas);
        if (cancelled) break;
      }
      if (!cancelled && hostRef.current) {
        hostRef.current.replaceChildren(wrap);
        setPages(maxPages);
        onRenderedRef.current?.(hostRef.current, maxPages);
      }
    };

    const run = async () => {
      try {
        setFailed('');
        if (mime.startsWith('image/')) await paintImage();
        else await paintPdf();
      } catch (err) {
        console.error('[protected doc]', err);
        if (!cancelled) setFailed('This document cannot be displayed in a protected view.');
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [fileBlob, fileMime]);

  return (
    <div className={styles.protected}>
      <div ref={hostRef} className={styles.canvasHost} />
      <div className={styles.guard} aria-hidden="true" />
      {failed && <p className={styles.error}>{failed}</p>}
      {pages > 0 && <span className={styles.srOnly}>{pages} pages</span>}
    </div>
  );
}
