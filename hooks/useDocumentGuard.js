import { useEffect, useState } from 'react';

const BLOCKED_KEYS = ['p', 's', 'c', 'u', 'a', 'i', 'g'];

/**
 * Deters copying, printing and screenshots while a protected document is on screen.
 * Returns `veiled` — true whenever the document should be hidden (window blurred,
 * capture shortcut in use, printing). A browser page cannot block every capture
 * method (e.g. a phone photographing the screen); this raises the bar.
 */
export default function useDocumentGuard() {
  const [veiled, setVeiled] = useState(false);

  useEffect(() => {
    const inForm = (e) => {
      const t = e.target;
      if (!t || typeof t.closest !== 'function') return false;
      return Boolean(t.closest('[data-form="1"], input, select, textarea, label, option'));
    };
    const prevent = (e) => {
      if (inForm(e)) return undefined;
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

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
    const sync = () => {
      const blocked = document.hidden || !document.hasFocus() || armed || Date.now() < holdUntil;
      setVeiled(Boolean(blocked));
    };
    const onFocus = () => {
      arm();
      hold(800);
      sync();
    };
    const onMove = (e) => {
      if (!armed) return;
      if (e.metaKey && e.shiftKey) return;
      if (Date.now() - armedAt < 600) return;
      armed = false;
      sync();
    };
    const onKey = (e) => {
      const target = e.target;
      const typing = target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT');
      const key = e.key?.toLowerCase();
      const combo = e.ctrlKey || e.metaKey;

      // Cmd/Win + Shift starts every OS screenshot shortcut.
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
      if (combo && BLOCKED_KEYS.includes(key) && !typing) prevent(e);
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
    window.addEventListener('focus', onFocus);
    window.addEventListener('pagehide', hide);
    document.addEventListener('visibilitychange', sync);
    const poll = window.setInterval(sync, 80);
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
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('pagehide', hide);
      document.removeEventListener('visibilitychange', sync);
      window.clearInterval(poll);
      printMq?.removeEventListener?.('change', onMq);
    };
  }, []);

  return veiled;
}
