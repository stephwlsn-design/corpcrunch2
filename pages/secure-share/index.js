import { useRef, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { buildSecureShareSeo, SECURE_SHARE_FAQ } from '@/lib/seoHelpers';
import styles from './SecureShare.module.css';

const seo = buildSecureShareSeo();

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/gif'];

const EXPIRY = [
  { id: '1d', label: '24 hours' },
  { id: '3d', label: '3 days' },
  { id: '7d', label: '7 days' },
];

const STEPS = [
  { n: '01', title: 'Upload', note: 'Choose a PDF or image. No account and no sign-up.' },
  { n: '02', title: 'Share the link', note: 'You get one private link. Send it to the person who needs it.' },
  { n: '03', title: 'Viewed once', note: 'They open it one time. After that, the link stops working.' },
];

const PROTECTIONS = [
  ['One view only', 'The first open uses up the link. Preview bots and link scanners cannot trigger it.'],
  ['Encrypted at rest', 'Every file is stored encrypted, never as a readable file.'],
  ['Unguessable links', 'Links are long random codes, and we only keep a one-way hash of them.'],
  ['Optional passcode', 'Add a passcode you share separately. Too many wrong tries locks the link.'],
  ['Protected viewer', 'No download, print, copy or screenshot shortcuts in the viewer.'],
  ['Auto expiry', 'Links expire in 24 hours to 7 days, and files are deleted after 30 days.'],
];

function readAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SecureSharePage() {
  const [file, setFile] = useState(null);
  const [expiry, setExpiry] = useState('7d');
  const [passcode, setPasscode] = useState('');
  const [note, setNote] = useState('');
  const [website, setWebsite] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const pickFile = (e) => {
    const picked = e.target.files?.[0];
    setError('');
    if (!picked) {
      setFile(null);
      return;
    }
    const type = picked.type || (/\.pdf$/i.test(picked.name) ? 'application/pdf' : '');
    if (!ALLOWED.includes(type)) {
      setError('Only PDF files and images (PNG, JPG, WebP, GIF) are supported.');
      setFile(null);
      e.target.value = '';
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError('Files must be 3 MB or smaller.');
      setFile(null);
      e.target.value = '';
      return;
    }
    setFile(picked);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!file) {
      setError('Choose a file to send.');
      return;
    }
    if (passcode && (passcode.length < 4 || passcode.length > 64)) {
      setError('A passcode must be 4 to 64 characters.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const contentBase64 = await readAsBase64(file);
      const res = await fetch('/api/secure-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentBase64,
          fileName: file.name,
          expiry,
          passcode: passcode.trim(),
          note: note.trim(),
          website,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.data?.url) {
        throw new Error(json.message || 'We could not create your link. Please try again.');
      }
      setResult(json.data);
      setFile(null);
      setPasscode('');
      setNote('');
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err.message || 'We could not create your link. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Copy failed. Select the link and copy it manually.');
    }
  };

  const reset = () => {
    setResult(null);
    setCopied(false);
    setError('');
  };

  return (
    <Layout seo={seo} hideChatbot>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.kicker}>Free. No sign-up.</p>
            <h1>
              Send a file that can be viewed <span className={styles.mark}>only once</span>.
            </h1>
            <p className={styles.lead}>
              Upload a PDF or image, get a private one-time link, and share it. When it has been
              opened, it&apos;s gone. Encrypted, optional passcode, automatic expiry.
            </p>
            <ul className={styles.ticks}>
              <li>No account or email needed</li>
              <li>Opens once, then the link stops working</li>
              <li>View-only. No download or print</li>
            </ul>
          </div>

          <div className={styles.card} id="send" data-secure-form="1">
            {result ? (
              <div className={styles.done}>
                <p className={styles.kicker}>Your one-time link is ready</p>
                <h2>Copy it now</h2>
                <p className={styles.small}>
                  For your security we can&apos;t show this link again. Anyone with it can open the file
                  once{result.requiresPasscode ? ', and they will need your passcode' : ''}.
                </p>
                <div className={styles.linkBox}>
                  <code>{result.url}</code>
                </div>
                <div className={styles.row}>
                  <button type="button" className={styles.primary} onClick={copy}>
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                  <button type="button" className={styles.secondary} onClick={reset}>
                    Send another file
                  </button>
                </div>
                <p className={styles.small}>
                  Expires {new Date(result.expiresAt).toLocaleString()} if it isn&apos;t opened before then.
                </p>
                {error && <p className={styles.error}>{error}</p>}
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <p className={styles.kicker}>Send a file</p>
                <h2>Create a one-time link</h2>

                <label className={styles.drop} htmlFor="ss-file">
                  <input
                    ref={inputRef}
                    id="ss-file"
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/webp,image/gif"
                    onChange={pickFile}
                  />
                  {file ? (
                    <span>
                      <strong>{file.name}</strong>
                      <em>{formatSize(file.size)}. Click to change.</em>
                    </span>
                  ) : (
                    <span>
                      <strong>Choose a PDF or image</strong>
                      <em>Up to 3 MB</em>
                    </span>
                  )}
                </label>

                <label className={styles.field}>
                  <span className={styles.labelText}>Link expires after</span>
                  <select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
                    {EXPIRY.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.labelText}>
                    Passcode <em>(optional)</em>
                  </span>
                  <input
                    type="text"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    autoComplete="off"
                    placeholder="Share it separately with the recipient"
                    maxLength={64}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.labelText}>
                    Message to the recipient <em>(optional)</em>
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    maxLength={300}
                    placeholder="Shown before they open the file"
                  />
                </label>

                {/* Honeypot: hidden from people, filled by bots. */}
                <div className={styles.hp} aria-hidden="true">
                  <label>
                    Website
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </label>
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <button type="submit" className={styles.primary} disabled={busy}>
                  {busy ? 'Encrypting and uploading…' : 'Create secure link'}
                </button>
                <p className={styles.fine}>
                  By sending a file you agree to our{' '}
                  <Link href="/terms-of-service">terms</Link>. Don&apos;t send anything illegal. Files may be
                  reviewed by Corp Crunch to prevent abuse, and are deleted after 30 days.
                </p>
              </form>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.kicker}>How it works</p>
          <h2 className={styles.h2}>Three steps, nothing to install</h2>
          <div className={styles.steps}>
            {STEPS.map((step) => (
              <div key={step.n} className={styles.step}>
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.kicker}>Security</p>
          <h2 className={styles.h2}>Built to be private by default</h2>
          <div className={styles.grid}>
            {PROTECTIONS.map(([title, note]) => (
              <div key={title} className={styles.tile}>
                <h3>{title}</h3>
                <p>{note}</p>
              </div>
            ))}
          </div>
          <p className={styles.honest}>
            No web page can stop someone photographing their screen. Share sensitive files only with
            people you trust.
          </p>
        </section>

        <section className={styles.section}>
          <p className={styles.kicker}>FAQ</p>
          <h2 className={styles.h2}>Questions, answered</h2>
          <div className={styles.faq}>
            {SECURE_SHARE_FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <h2>Intelligence for the people who run companies</h2>
          <p>
            Secure Share is a free tool from Corp Crunch. Explore our reporting, events and technology.
          </p>
          <div className={styles.row}>
            <Link href="/" className={styles.primary}>
              Read Corp Crunch
            </Link>
            <Link href="/products" className={styles.secondary}>
              See our products
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
