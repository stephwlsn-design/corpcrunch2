import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import useDocumentGuard from '@/hooks/useDocumentGuard';
import styles from './SecureView.module.css';

const ProtectedDoc = dynamic(() => import('@/pages/proposals/view/ProtectedDoc'), { ssr: false });

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SecureShareViewPage({ token }) {
  const [phase, setPhase] = useState('checking'); // checking | ready | unavailable | opening | viewing
  const [info, setInfo] = useState(null);
  const [message, setMessage] = useState('');
  const [passcode, setPasscode] = useState('');
  const [needsPasscode, setNeedsPasscode] = useState(false);
  const [blob, setBlob] = useState(null);
  const [reported, setReported] = useState(false);
  const checked = useRef(false);
  const veiled = useDocumentGuard();

  useEffect(() => {
    if (!token || checked.current) return;
    checked.current = true;
    (async () => {
      try {
        const res = await fetch(`/api/secure-share/${encodeURIComponent(token)}`, {
          cache: 'no-store',
        });
        const json = await res.json().catch(() => ({}));
        const data = json?.data;
        if (!res.ok || !data?.available) {
          setMessage(data?.message || json?.message || 'This link is not available.');
          setPhase('unavailable');
          return;
        }
        setInfo(data);
        setNeedsPasscode(Boolean(data.requiresPasscode));
        setPhase('ready');
      } catch {
        setMessage('We could not check this link. Please try again.');
        setPhase('unavailable');
      }
    })();
  }, [token]);

  const openDocument = async (e) => {
    e?.preventDefault();
    if (phase === 'opening') return;
    setMessage('');
    if (needsPasscode && !passcode.trim()) {
      setMessage('Enter the passcode to continue.');
      return;
    }
    setPhase('opening');
    try {
      const res = await fetch(`/api/secure-share/${encodeURIComponent(token)}/open`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setMessage(json.message || 'This document could not be opened.');
        if (json.needsPasscode) {
          setNeedsPasscode(true);
          setPhase('ready');
        } else {
          setPhase('unavailable');
        }
        return;
      }
      const file = await res.blob();
      setBlob(file);
      setPasscode('');
      setPhase('viewing');
    } catch {
      setMessage('The connection dropped. Check your link and try again.');
      setPhase('ready');
    }
  };

  const report = async () => {
    if (reported) return;
    if (!window.confirm('Report this link as abusive or unwanted? It will be held for review.')) return;
    try {
      await fetch(`/api/secure-share/${encodeURIComponent(token)}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Reported from the recipient page' }),
      });
    } catch {
      /* best effort */
    }
    setReported(true);
    setPhase('unavailable');
    setMessage('Thank you. This link has been held for review.');
  };

  return (
    <>
      <Head>
        <title>Secure document | Corp Crunch</title>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="referrer" content="no-referrer" />
        <style>{`
          @media print {
            html, body, * { display: none !important; visibility: hidden !important; }
          }
        `}</style>
      </Head>

      <div className={styles.page}>
        <header className={styles.nav}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.logo}
            src="/assets/img/logo/Corp%20Crunch%20Black%20Logo.png"
            alt="Corp Crunch"
            draggable={false}
          />
          <span className={styles.badge}>Secure Share</span>
        </header>

        <main className={phase === 'viewing' ? styles.wide : styles.narrow}>
          {phase === 'checking' && (
            <div className={styles.card}>
              <span className={styles.pulse} aria-hidden="true" />
              <p className={styles.muted}>Checking your secure link…</p>
            </div>
          )}

          {phase === 'unavailable' && (
            <div className={styles.card}>
              <h1>Link not available</h1>
              <p className={styles.muted}>{message || 'This link is not available.'}</p>
              <Link href="/secure-share" className={styles.primary}>
                Send your own file, free
              </Link>
            </div>
          )}

          {(phase === 'ready' || phase === 'opening') && info && (
            <form className={styles.card} onSubmit={openDocument} data-form="1">
              <p className={styles.kicker}>Someone sent you a private document</p>
              <h1>Open it once</h1>
              <div className={styles.file}>
                <strong>{info.fileName}</strong>
                <span>{formatSize(info.fileSize)}</span>
              </div>
              {info.note && <blockquote className={styles.note}>{info.note}</blockquote>}
              <ul className={styles.rules}>
                <li>You can view this document one time only.</li>
                <li>Once it opens, the link stops working, so don&apos;t refresh or close the tab.</li>
                <li>It can&apos;t be downloaded, printed or copied from this page.</li>
              </ul>

              {needsPasscode && (
                <label className={styles.field}>
                  Passcode from the sender
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    autoComplete="off"
                    autoFocus
                  />
                </label>
              )}
              {message && <p className={styles.error}>{message}</p>}

              <button type="submit" className={styles.primary} disabled={phase === 'opening'}>
                {phase === 'opening' ? 'Opening…' : 'Open document (one time)'}
              </button>
              <span
                role="button"
                tabIndex={0}
                className={styles.link}
                onClick={report}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    report();
                  }
                }}
              >
                Report this link
              </span>
            </form>
          )}

          {phase === 'viewing' && blob && (
            <>
              <div className={styles.banner}>
                This is your one-time view. If you refresh or leave this page, the document will not open
                again.
              </div>
              <div className={`${styles.stage} ${veiled ? styles.stageVeiled : ''}`}>
                <div className={styles.content}>
                  <ProtectedDoc fileBlob={blob} fileMime={info?.fileMime || blob.type} />
                </div>
                <div className={styles.veil} aria-hidden="true" />
              </div>
              <div className={styles.cta}>
                <p>Need to send a document securely? It&apos;s free, with no sign-up.</p>
                <Link href="/secure-share" className={styles.primary}>
                  Send a file with Corp Crunch
                </Link>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps({ params, res }) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Referrer-Policy', 'no-referrer');
  return { props: { token: String(params.token || '') } };
}
