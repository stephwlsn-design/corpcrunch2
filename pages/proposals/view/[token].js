import { useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import connectDB from '@/lib/mongoose';
import ProposalFeedback from '@/models/ProposalFeedback';
import {
  PROPOSAL_BUDGET_STATUSES,
  PROPOSAL_BUDGET_TYPES,
  PROPOSAL_CURRENCIES,
  PROPOSAL_DECISION_OPTIONS,
  PROPOSAL_FLEXIBILITY,
  PROPOSAL_REJECTION_REASONS,
  PROPOSAL_SERVICES,
} from '@/lib/proposalConstants';
import { uniqueUnavailableMessage } from '@/lib/proposalAccess';
import { requireLiveProposal } from '@/lib/proposalService';
import styles from './View.module.css';

const ProtectedDoc = dynamic(() => import('./ProtectedDoc'), { ssr: false });

const BLOCKED_KEYS = ['p', 's', 'c', 'u', 'a', 'i', 'g'];

function datePlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const FOLLOW_PRESETS = [
  { label: 'In 2 weeks', days: 14 },
  { label: 'In 1 month', days: 30 },
  { label: 'In 3 months', days: 90 },
];

const BUDGET_POINTS = [
  '0',
  '5,000',
  '10,000',
  '25,000',
  '50,000',
  '100,000',
  '250,000',
  '500,000',
  '1,000,000+',
];

function budgetValue(label) {
  return Number(String(label).replace(/[^\d]/g, '')) || 0;
}

function ping(token, payload) {
  if (!token) return;
  fetch(`/api/proposals/${token}/events`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

export default function ProposalViewerPage({
  token,
  title,
  clientName,
  clientDesignation,
  clientCompany,
  fileMime,
  alreadyResponded,
  error,
}) {
  const [status, setStatus] = useState(error ? 'error' : 'loading');
  const [message, setMessage] = useState(error || '');
  const [fileBlob, setFileBlob] = useState(null);
  const [veiled, setVeiled] = useState(false);
  const [decision, setDecision] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [services, setServices] = useState([]);
  const [noneExtra, setNoneExtra] = useState(false);
  const [serviceNotes, setServiceNotes] = useState({});
  const [comments, setComments] = useState('');
  const [followUpAt, setFollowUpAt] = useState('');
  const [budgetCurrency, setBudgetCurrency] = useState('USD');
  const [budgetFrom, setBudgetFrom] = useState('');
  const [budgetTo, setBudgetTo] = useState('');
  const [budgetType, setBudgetType] = useState('');
  const [budgetStatus, setBudgetStatus] = useState('');
  const [budgetFlex, setBudgetFlex] = useState('');
  const [layout, setLayout] = useState('split');
  const [splitPct, setSplitPct] = useState(42);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const fetched = useRef(false);
  const seenPages = useRef(new Set());
  const lastBeat = useRef(Date.now());
  const currentSection = useRef('document');
  const workspaceRef = useRef(null);
  const dragging = useRef(false);
  const leadRef = useRef(null);
  const [handleTop, setHandleTop] = useState(0);

  useEffect(() => {
    if (!token || error || fetched.current) return undefined;
    fetched.current = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/proposals/${token}/file`, { credentials: 'include' });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.message || uniqueUnavailableMessage());
        }
        const blob = await res.blob();
        if (!blob || blob.size < 8) {
          throw new Error('This document cannot be displayed in a protected view.');
        }
        setFileBlob(blob);
        setStatus('ready');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || uniqueUnavailableMessage());
      }
    };
    load();
  }, [token, error]);

  useEffect(() => {
    const inForm = (e) => {
      const t = e.target;
      if (!t || typeof t.closest !== 'function') return false;
      return Boolean(t.closest('[data-form="1"], input, select, textarea, label, option'));
    };
    const prevent = (e) => {
      if (inForm(e)) return;
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    // The document stays hidden while a capture shortcut is (or was just) in use.
    // `armed` = Cmd/Win+Shift held or just released: stays hidden until the mouse
    // moves again, because OS crosshair capture (Cmd+Shift+4) runs after the keys
    // are released and the page receives no events while it is active.
    let armed = false;
    let armedAt = 0;
    let holdUntil = 0;
    const hold = (ms) => {
      holdUntil = Math.max(holdUntil, Date.now() + ms);
    };
    const arm = () => {
      armed = true;
      armedAt = Date.now();
    };
    const hide = () => setVeiled(true);
    const syncFocus = () => {
      const blocked =
        document.hidden || !document.hasFocus() || armed || Date.now() < holdUntil;
      setVeiled(Boolean(blocked));
    };
    const show = () => {
      // Returning from a screenshot overlay: stay hidden until the mouse moves.
      arm();
      hold(800);
      syncFocus();
    };
    const onMove = (e) => {
      if (!armed) return;
      if (e.metaKey && e.shiftKey) return;
      if (Date.now() - armedAt < 600) return;
      armed = false;
      syncFocus();
    };
    const onKey = (e) => {
      const target = e.target;
      const typing = target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT');
      const key = e.key?.toLowerCase();
      const combo = e.ctrlKey || e.metaKey;

      // Cmd/Win + Shift starts every OS screenshot shortcut
      // (Cmd+Shift+3/4/5, Win+Shift+S). Hide the moment both are down,
      // before the final key is pressed.
      if (e.metaKey && e.shiftKey) {
        arm();
        hide();
      }

      const shot =
        e.key === 'PrintScreen' ||
        e.key === 'Snapshot' ||
        e.keyCode === 44 ||
        (e.shiftKey && combo && ['3', '4', '5', 's'].includes(key));
      if (shot) {
        prevent(e);
        arm();
        hold(2500);
        hide();
      }
      if (combo && BLOCKED_KEYS.includes(key) && !(typing && key === 'a')) prevent(e);
      if (e.key === 'F12') prevent(e);
    };
    const onPrint = (e) => {
      prevent(e);
      hold(2000);
      hide();
    };

    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('cut', prevent);
    document.addEventListener('dragstart', prevent);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('keyup', onKey, true);
    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerdown', onMove, true);
    window.addEventListener('beforeprint', onPrint);
    window.addEventListener('afterprint', onPrint);
    window.addEventListener('blur', hide);
    window.addEventListener('focus', show);
    window.addEventListener('pagehide', hide);
    document.addEventListener('visibilitychange', syncFocus);
    const poll = window.setInterval(syncFocus, 80);
    const printMq = window.matchMedia ? window.matchMedia('print') : null;
    const onMq = (ev) => {
      if (ev.matches) hide();
    };
    printMq?.addEventListener?.('change', onMq);

    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent);
      document.removeEventListener('dragstart', prevent);
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('keyup', onKey, true);
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerdown', onMove, true);
      window.removeEventListener('beforeprint', onPrint);
      window.removeEventListener('afterprint', onPrint);
      window.removeEventListener('blur', hide);
      window.removeEventListener('focus', show);
      window.removeEventListener('pagehide', hide);
      document.removeEventListener('visibilitychange', syncFocus);
      window.clearInterval(poll);
      printMq?.removeEventListener?.('change', onMq);
    };
  }, []);

  // Keep the split handle on the same line as the "Hello …" intro.
  useEffect(() => {
    const measure = () => {
      const ws = workspaceRef.current;
      const lead = leadRef.current;
      if (!ws || !lead) return;
      const top =
        lead.getBoundingClientRect().top - ws.getBoundingClientRect().top + lead.offsetHeight / 2 - 14;
      setHandleTop(Math.max(0, Math.round(top)));
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) {
      if (workspaceRef.current) ro.observe(workspaceRef.current);
      if (leadRef.current) ro.observe(leadRef.current);
    }
    window.addEventListener('resize', measure);
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [layout, splitPct, status]);

  useEffect(() => {
    if (status !== 'ready' || !token) return undefined;
    lastBeat.current = Date.now();
    const beat = () => {
      const now = Date.now();
      const durationMs = Math.min(now - lastBeat.current, 20000);
      lastBeat.current = now;
      ping(token, { type: 'heartbeat', durationMs, section: currentSection.current });
    };
    const id = window.setInterval(beat, 15000);
    const onLeave = () => beat();
    window.addEventListener('pagehide', onLeave);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) beat();
    });
    return () => {
      window.clearInterval(id);
      window.removeEventListener('pagehide', onLeave);
      beat();
    };
  }, [status, token]);

  const onRendered = useCallback(
    (host) => {
      if (!host || !token) return;
      const nodes = host.querySelectorAll('[data-section]');
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const section = entry.target.dataset.section || 'document';
            currentSection.current = section;
            if (!seenPages.current.has(section)) {
              seenPages.current.add(section);
              ping(token, { type: 'section', section, durationMs: 0 });
            }
          });
        },
        { threshold: 0.45 }
      );
      nodes.forEach((node) => io.observe(node));
    },
    [token]
  );

  useEffect(() => {
    const move = (e) => {
      if (!dragging.current || !workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(72, Math.max(28, pct)));
      setLayout('split');
    };
    const up = () => {
      dragging.current = false;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  const onSplitDown = (e) => {
    dragging.current = true;
    e.preventDefault();
  };

  const toggleService = (id) => {
    setNoneExtra(false);
    setServices((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const submit = async () => {
    if (!decision || sending) return;
    if (decision === 'discuss' && !rejectionReason) {
      setMessage('Tell us what you would like to discuss.');
      return;
    }
    if (!budgetFrom || !budgetTo) {
      setMessage('Select a budget from and to range.');
      return;
    }
    if (budgetValue(budgetTo) < budgetValue(budgetFrom)) {
      setMessage('The “to” amount should be equal to or above the “from” amount.');
      return;
    }
    if (decision === 'no' && !followUpAt) {
      setMessage('Select a date for us to follow up.');
      return;
    }
    setSending(true);
    setMessage('');
    try {
      const res = await fetch(`/api/proposals/${token}/feedback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          rejectionReason,
          comments,
          services: noneExtra ? [] : services,
          noneExtra,
          serviceNotes,
          followUpAt,
          budget: {
            currency: budgetCurrency,
            from: budgetFrom,
            to: budgetTo,
            range: `${budgetFrom} – ${budgetTo}`,
            type: budgetType,
            status: budgetStatus,
            flexibility: budgetFlex,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || 'Could not send your response');
      setSent(true);
      ping(token, { type: 'section', section: 'feedback', durationMs: 0 });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSending(false);
    }
  };

  const firstName = (clientName || '').split(' ')[0] || 'there';

  return (
    <>
      <Head>
        <title>{`${title || 'Document'} | Corp Crunch`}</title>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex" />
        <meta name="referrer" content="no-referrer" />
        <style>{`
          @media print {
            html, body, * { display: none !important; visibility: hidden !important; }
          }
        `}</style>
      </Head>
      <main className={styles.page}>
        <header className={styles.nav}>
          <div className={styles.brandMark} aria-label="Corp Crunch">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.brandLogo}
              src="/assets/img/logo/Corp%20Crunch%20Black%20Logo.png"
              alt="Corp Crunch"
              draggable={false}
            />
          </div>
          <span className={styles.enquire}>View only</span>
        </header>

        <div
          ref={workspaceRef}
          className={`${styles.workspace} ${styles[layout]}`}
          style={layout === 'split' ? { '--split': `${splitPct}%` } : undefined}
        >
          <aside className={styles.left}>
            <p className={styles.kicker}>
              Prepared for {clientName || 'you'}
              {[clientDesignation, clientCompany].filter(Boolean).length > 0 && (
                <span className={styles.kickerMeta}>
                  {[clientDesignation, clientCompany].filter(Boolean).join(', ')}
                </span>
              )}
            </p>
            <h1>
              Review this proposal into a
              <span className={styles.mark}>clear next step</span>
            </h1>
            <p className={styles.lead} ref={leadRef}>
              Hello {firstName}. Choose one next step. We will take it from there.
            </p>
            <section className={styles.respond} id="respond" data-form="1">
              {alreadyResponded && !sent && (
                <p className={styles.note}>A response is already on file. You can send an update.</p>
              )}
              {sent && (
                <div className={styles.thanks}>
                  <h3>Thank you. Corp Crunch has your response.</h3>
                  <p>
                    {decision === 'no' && followUpAt
                      ? `We will follow up on ${new Date(followUpAt).toLocaleDateString()}.`
                      : decision === 'proceed'
                        ? 'The team will begin the next steps with you.'
                        : 'The team will be in touch to discuss.'}
                  </p>
                </div>
              )}

              {status === 'error' && <p className={styles.error}>{message}</p>}

              {status !== 'error' && !sent && (
                <div className={styles.respondBody}>
                  <div className={styles.stepBlock}>
                    <p className={styles.stepLabel}>Question 1</p>
                    <h2>What’s your tentative budget for this project?</h2>
                    <div className={styles.selectRow}>
                      <label className={styles.selectLabel}>
                        Currency
                        <select
                          className={styles.select}
                          value={budgetCurrency}
                          onChange={(e) => setBudgetCurrency(e.target.value)}
                        >
                          {PROPOSAL_CURRENCIES.map((item) => (
                            <option key={item.code} value={item.code}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={styles.selectLabel}>
                        From
                        <select
                          className={styles.select}
                          value={budgetFrom}
                          onChange={(e) => setBudgetFrom(e.target.value)}
                        >
                          <option value="">From</option>
                          {BUDGET_POINTS.map((item) => (
                            <option key={`from-${item}`} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className={styles.selectLabel}>
                        To
                        <select
                          className={styles.select}
                          value={budgetTo}
                          onChange={(e) => setBudgetTo(e.target.value)}
                        >
                          <option value="">To</option>
                          {BUDGET_POINTS.map((item) => (
                            <option key={`to-${item}`} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {budgetFrom && budgetTo && (
                      <div className={styles.selectStack}>
                        <label className={styles.selectLabel}>
                          Budget type
                          <select
                            className={styles.select}
                            value={budgetType}
                            onChange={(e) => setBudgetType(e.target.value)}
                          >
                            <option value="">Select type</option>
                            {PROPOSAL_BUDGET_TYPES.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className={styles.selectLabel}>
                          Status
                          <select
                            className={styles.select}
                            value={budgetStatus}
                            onChange={(e) => setBudgetStatus(e.target.value)}
                          >
                            <option value="">Select status</option>
                            {PROPOSAL_BUDGET_STATUSES.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className={styles.selectLabel}>
                          Flexibility
                          <select
                            className={styles.select}
                            value={budgetFlex}
                            onChange={(e) => setBudgetFlex(e.target.value)}
                          >
                            <option value="">Select flexibility</option>
                            {PROPOSAL_FLEXIBILITY.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className={`${styles.stepBlock} ${styles.stepBlue}`}>
                    <p className={styles.stepLabel}>Question 2</p>
                    <h2>Ready to move forward?</h2>
                    <div className={styles.choiceList}>
                      {PROPOSAL_DECISION_OPTIONS.map((item) => (
                        <label key={item.id} className={styles.choice}>
                          <input
                            type="radio"
                            name="decision"
                            value={item.id}
                            checked={decision === item.id}
                            onChange={() => setDecision(item.id)}
                          />
                          <strong>{item.label}</strong>
                        </label>
                      ))}
                    </div>
                  </div>

                  {decision === 'no' && (
                    <div className={styles.stepBlock}>
                      <p className={styles.stepLabel}>Pick a follow-up date</p>
                      <h2>When should we come back to this?</h2>
                      <label className={styles.selectLabel}>
                        Follow up
                        <select
                          className={styles.select}
                          value={followUpAt}
                          onChange={(e) => setFollowUpAt(e.target.value)}
                        >
                          <option value="">Select a date</option>
                          {FOLLOW_PRESETS.map((item) => {
                            const value = datePlus(item.days);
                            return (
                              <option key={item.label} value={value}>
                                {item.label} ({value})
                              </option>
                            );
                          })}
                        </select>
                      </label>
                      <label className={styles.dateLabel}>
                        Or pick a calendar date
                        <input
                          className={styles.dateInput}
                          type="date"
                          min={datePlus(0)}
                          value={followUpAt}
                          onChange={(e) => setFollowUpAt(e.target.value)}
                        />
                      </label>
                      <label className={styles.selectLabel} style={{ marginTop: 16 }}>
                        Anything holding this back?
                        <select
                          className={styles.select}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        >
                          <option value="">Select a reason (optional)</option>
                          {PROPOSAL_REJECTION_REASONS.map((reason) => (
                            <option key={reason} value={reason}>
                              {reason}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}

                  {decision === 'discuss' && (
                    <div className={styles.stepBlock}>
                      <p className={styles.stepLabel}>Help us prepare</p>
                      <h2>What should we cover?</h2>
                      <label className={styles.selectLabel}>
                        Topic
                        <select
                          className={styles.select}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        >
                          <option value="">Select what we should cover</option>
                          {PROPOSAL_REJECTION_REASONS.map((reason) => (
                            <option key={reason} value={reason}>
                              {reason}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}

                  {decision && (
                    <div className={`${styles.stepBlock} ${styles.stepBlue}`}>
                      <p className={styles.stepLabel}>Question 3</p>
                      <h2>
                        {decision === 'proceed'
                          ? 'Add anything else to this engagement?'
                          : decision === 'discuss'
                            ? 'Should we also cover another service?'
                            : 'Include anything else in the follow-up?'}
                      </h2>
                      <div className={styles.choiceList}>
                        {PROPOSAL_SERVICES.map((item) => {
                          const on = services.includes(item.id) && !noneExtra;
                          return (
                            <div key={item.id}>
                              <label className={styles.choice}>
                                <input
                                  type="checkbox"
                                  checked={on}
                                  onChange={() => toggleService(item.id)}
                                />
                                <span>
                                  <strong>{item.label}</strong>
                                  <span className={styles.hint}>{item.areas}</span>
                                </span>
                              </label>
                              {on && (
                                <textarea
                                  value={serviceNotes[item.id] || ''}
                                  onChange={(e) =>
                                    setServiceNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                                  }
                                  placeholder="What should we include?"
                                />
                              )}
                            </div>
                          );
                        })}
                        <label className={styles.choice}>
                          <input
                            type="checkbox"
                            checked={noneExtra}
                            onChange={() => {
                              setNoneExtra(true);
                              setServices([]);
                            }}
                          />
                          <span>
                            <strong>Just this proposal</strong>
                            <span className={styles.hint}>No additional services for now.</span>
                          </span>
                        </label>
                      </div>
                    </div>
                  )}

                  {decision && (
                    <div className={styles.stepBlock}>
                      <p className={styles.stepLabel}>Send</p>
                      <h2>
                        {decision === 'proceed'
                          ? 'Anything we should prepare for kickoff?'
                          : decision === 'discuss'
                            ? 'Any context for the conversation?'
                            : 'Note for the follow-up (optional)'}
                      </h2>
                      <textarea
                        className={styles.comments}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder={
                          decision === 'proceed'
                            ? 'Timeline, stakeholders, or kickoff notes'
                            : 'Optional note'
                        }
                      />
                      {message && <p className={styles.dockError}>{message}</p>}
                      <button
                        type="button"
                        className={styles.send}
                        disabled={
                          sending ||
                          status !== 'ready' ||
                          !budgetFrom ||
                          !budgetTo ||
                          budgetValue(budgetTo) < budgetValue(budgetFrom) ||
                          (decision === 'discuss' && !rejectionReason) ||
                          (decision === 'no' && !followUpAt)
                        }
                        onClick={submit}
                      >
                        {sending
                          ? 'Sending…'
                          : decision === 'proceed'
                            ? 'Confirm and start'
                            : decision === 'discuss'
                              ? 'Request a conversation'
                              : 'Schedule follow-up'}
                        <span aria-hidden="true">→</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </aside>

          {layout === 'split' && (
            <div
              className={styles.splitter}
              role="separator"
              aria-orientation="vertical"
              aria-label="Adjust split view"
              onPointerDown={onSplitDown}
              onDoubleClick={() => setSplitPct(42)}
            >
              <span className={styles.accordion} style={{ marginTop: handleTop }} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 6 9 12 15 18" />
                </svg>
                <span className={styles.accordionLine} />
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </span>
            </div>
          )}

          <section className={styles.right}>
            <p className={styles.docLabel}>{title || 'Document'}</p>
            {status === 'loading' && (
              <div className={styles.loader}>
                <span className={styles.pulse} aria-hidden="true" />
                <p>Opening a private document…</p>
              </div>
            )}
            {status === 'error' && <p className={styles.error}>{message}</p>}
            {status === 'ready' && fileBlob && (
              <div className={`${styles.stage} ${veiled ? styles.stageVeiled : ''}`}>
                <ProtectedDoc fileBlob={fileBlob} fileMime={fileMime} onRendered={onRendered} />
                <div className={styles.veil} aria-hidden="true" />
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps({ params, res }) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Referrer-Policy', 'no-referrer');

  try {
    await connectDB();
    const result = await requireLiveProposal(params.token);
    if (result.error || !result.proposal.fileId) {
      return {
        props: {
          token: '',
          title: '',
          clientName: '',
          clientEmail: '',
          fileMime: '',
          alreadyResponded: false,
          error: uniqueUnavailableMessage(),
        },
      };
    }
    const existing = await ProposalFeedback.exists({ proposal: result.proposal._id });
    return {
      props: {
        token: result.proposal.token,
        title: result.proposal.title,
        clientName: result.proposal.clientName || '',
        clientDesignation: result.proposal.clientDesignation || '',
        clientCompany: result.proposal.clientCompany || '',
        clientEmail: result.proposal.clientEmail || '',
        fileMime: result.proposal.fileMime || '',
        alreadyResponded: Boolean(existing),
        error: '',
      },
    };
  } catch (error) {
    console.error('[proposal view]', error);
    return {
      props: {
        token: '',
        title: '',
        clientName: '',
        clientEmail: '',
        fileMime: '',
        alreadyResponded: false,
        error: uniqueUnavailableMessage(),
      },
    };
  }
}
