import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import NumbersThatMatter from '@/components/about/NumbersThatMatter';
import TeamMembers from '@/components/about/TeamMembers';
import { buildProposalsSeo } from '@/lib/seoHelpers';
import connectDB from '@/lib/mongoose';
import AboutStats from '@/models/AboutStats';
import AboutContent from '@/models/AboutContent';
import styles from './Proposals.module.css';

const proposalsSeo = buildProposalsSeo();

const TESTIMONIALS = [
  {
    quote:
      'The brief was complex and the timeline was tight. Corp Crunch delivered a proposal we could actually take to the board — clear, commercial, and grounded in how our market works.',
    name: 'Chief Marketing Officer',
    org: 'Regional financial services group',
  },
  {
    quote:
      'We needed more than a media plan. Their team connected publishing, events, and technology in one conversation. That is rare, and it showed in the results.',
    name: 'Head of Growth',
    org: 'Enterprise MarTech platform',
  },
  {
    quote:
      'What stood out was the follow-through. The numbers they put in front of us were the numbers they later delivered against — reach, quality of audience, and commercial impact.',
    name: 'Director of Communications',
    org: 'GCC holding company',
  },
];

const EXPERTISE = [
  {
    n: '01',
    title: 'Media & publishing',
    note: 'Corporate intelligence, editorial, and distribution that reaches the rooms that matter.',
    icon: 'media',
  },
  {
    n: '02',
    title: 'MarTech & AdTech',
    note: 'Go-to-market, brand systems, and performance architecture for growth teams.',
    icon: 'tech',
  },
  {
    n: '03',
    title: 'Events & partnerships',
    note: 'High-impact summits and sponsor programmes with measurable commercial return.',
    icon: 'events',
  },
  {
    n: '04',
    title: 'Intelligent technology',
    note: 'FinTech, AI, and regulated-industry platforms built for operators, not decks.',
    icon: 'ai',
  },
];

function paintHover(el, on) {
  if (!el) return;
  if (on) {
    el.style.setProperty('background', '#e5e7eb', 'important');
    el.style.setProperty('background-color', '#e5e7eb', 'important');
    el.style.setProperty('color', '#111', 'important');
    el.querySelectorAll('*').forEach((node) => {
      node.style.setProperty('color', '#111', 'important');
    });
    return;
  }
  el.style.removeProperty('background');
  el.style.removeProperty('background-color');
  el.style.removeProperty('color');
  el.querySelectorAll('*').forEach((node) => {
    node.style.removeProperty('color');
  });
}

function ExpertiseIcon({ name }) {
  const common = {
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
  };
  if (name === 'media') {
    return (
      <svg {...common}>
        <rect x="6" y="10" width="36" height="24" rx="3" />
        <path d="M10 38h28M18 18h12M16 24h16" />
      </svg>
    );
  }
  if (name === 'tech') {
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="6" />
        <path d="M24 8v4M24 36v4M8 24h4M36 24h4M12 12l3 3M33 33l3 3M12 36l3-3M33 15l3-3" />
      </svg>
    );
  }
  if (name === 'events') {
    return (
      <svg {...common}>
        <rect x="8" y="12" width="32" height="28" rx="3" />
        <path d="M8 20h32M16 8v8M32 8v8M18 28h12" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M16 30c4-10 12-10 16 0" />
      <circle cx="18" cy="18" r="3" />
      <circle cx="30" cy="16" r="4" />
      <path d="M10 34h28" />
    </svg>
  );
}

export default function ProposalsPage({ stats = [], numbersText = '' }) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [activeQuote, setActiveQuote] = useState(0);
  const [openSkill, setOpenSkill] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hoverThumb, setHoverThumb] = useState(null);
  const [hoverSkill, setHoverSkill] = useState(null);

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => {
      setActiveQuote((current) => (current + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => clearInterval(id);
  }, [paused]);

  const openDocument = (e) => {
    e.preventDefault();
    const raw = code.trim();
    if (!raw) {
      setError('Paste the unique link or access code from your email.');
      return;
    }
    try {
      const url = raw.includes('://') ? new URL(raw) : null;
      const fromPath = url?.pathname?.match(/\/proposals\/view\/([^/?#]+)/);
      const token = fromPath?.[1] || raw.replace(/^\/+/, '');
      if (!token || token.includes('/')) {
        setError('That access code is not valid.');
        return;
      }
      router.push(`/proposals/view/${encodeURIComponent(token)}`);
    } catch {
      setError('That access code is not valid.');
    }
  };

  const quote = TESTIMONIALS[activeQuote];

  return (
    <Layout seo={proposalsSeo} hideCategoryNavigation={false} hideChatbot>
      <div className={styles.page}>
        <section className={styles.ntm} id="document">
          <div className={styles.ntmInner}>
            <div className={styles.heroGrid}>
              <div className={`${styles.cell} ${styles.heroTitle}`}>
                <p className={styles.kicker}>Private proposal</p>
                <h1 className={styles.title}>The work, in one sitting.</h1>
                <p className={styles.lead}>
                  You are viewing a Corp Crunch proposal. Explore the people, the results, and the craft — then open the document that was sent to you.
                </p>
                <nav className={styles.jump} aria-label="On this page">
                  <a href="#document">Document</a>
                  <a href="#testimonials">Testimonials</a>
                  <a href="#results">Results</a>
                  <a href="#expertise">Expertise</a>
                </nav>
              </div>
              <form className={`${styles.cell} ${styles.heroForm}`} onSubmit={openDocument}>
                <p className={styles.kicker}>Private access</p>
                <h2 className={styles.cellHeading}>Open your document</h2>
                <p className={styles.cellCopy}>Paste the unique link from your email. You can reopen it until the document deadline.</p>
                <label htmlFor="code">Unique link or access code</label>
                <input
                  id="code"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setError(''); }}
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="Paste link…"
                />
                {error && <p className={styles.error}>{error}</p>}
                <button type="submit">Enter the room</button>
              </form>
            </div>
          </div>
        </section>

        <section className={styles.ntm} id="testimonials">
          <div className={styles.ntmInner}>
            <div className={styles.blockHead}>
              <p className={styles.label}>Testimonials</p>
              <h2>What clients take from the work</h2>
            </div>
            <div
              className={styles.stage}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <blockquote className={styles.featured} key={quote.name}>
                <span className={styles.mark} aria-hidden="true">“</span>
                <p>{quote.quote}</p>
                <footer>
                  <strong>{quote.name}</strong>
                  <span>{quote.org}</span>
                </footer>
              </blockquote>
              <div className={styles.thumbs} role="tablist" aria-label="Client voices">
                {TESTIMONIALS.map((item, index) => (
                  <button
                    key={item.name}
                    type="button"
                    role="tab"
                    aria-selected={index === activeQuote}
                    data-hover={hoverThumb === index ? 'true' : 'false'}
                    className={`${index === activeQuote ? styles.thumbOn : styles.thumb} ${hoverThumb === index ? styles.thumbHover : ''}`}
                    onClick={() => setActiveQuote(index)}
                    onMouseEnter={(event) => {
                      setPaused(true);
                      setHoverThumb(index);
                      paintHover(event.currentTarget, true);
                    }}
                    onMouseLeave={(event) => {
                      setHoverThumb(null);
                      paintHover(event.currentTarget, false);
                    }}
                  >
                    <strong>{item.name}</strong>
                    <span>{item.org}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.ntm} id="expertise">
          <div className={styles.ntmInner}>
            <div className={styles.skillGrid}>
              <div className={`${styles.cell} ${styles.skillTitle}`}>
                <p className={styles.kicker}>Expertise</p>
                <h2 className={styles.title}>Where we operate</h2>
                <p className={styles.skillIntro}>
                  Media, growth, events, and intelligent technology — in the same proposal.
                </p>
              </div>
              {EXPERTISE.map((item, index) => {
                const open = openSkill === index;
                return (
                  <button
                    key={item.title}
                    type="button"
                    data-hover={hoverSkill === index ? 'true' : 'false'}
                    className={`${styles.cell} ${styles.skillCell} ${open ? styles.skillCellOn : ''} ${hoverSkill === index ? styles.skillHover : ''}`}
                    onClick={() => setOpenSkill(index)}
                    onMouseEnter={(event) => {
                      setHoverSkill(index);
                      paintHover(event.currentTarget, true);
                    }}
                    onMouseLeave={(event) => {
                      setHoverSkill(null);
                      paintHover(event.currentTarget, false);
                    }}
                    aria-expanded={open}
                  >
                    <span className={styles.iconWrap}>
                      <ExpertiseIcon name={item.icon} />
                    </span>
                    <span className={styles.statValue}>{item.n}</span>
                    <span className={styles.statLabel}>{item.title}</span>
                    <span className={styles.skillCopy}>{item.note}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <div className={styles.breakout} id="results">
        <NumbersThatMatter stats={stats} missionText={numbersText} centered />
        <TeamMembers />
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    await connectDB();
    const [stats, numbers] = await Promise.all([
      AboutStats.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean(),
      AboutContent.findOne({ section: 'numbers', isActive: true }).lean(),
    ]);
    return {
      props: {
        stats: JSON.parse(
          JSON.stringify(
            (stats || []).map((stat) => ({
              label: stat.label,
              value: stat.value,
              description: stat.description,
            }))
          )
        ),
        numbersText: numbers?.content || '',
      },
    };
  } catch (error) {
    console.error('[proposals] Failed to load about stats:', error.message);
    return { props: { stats: [], numbersText: '' } };
  }
}
