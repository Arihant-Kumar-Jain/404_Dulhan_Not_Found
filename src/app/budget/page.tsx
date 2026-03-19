'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useWizardStore } from '@/stores/wizardStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { formatCurrency } from '@/data/constants';
import styles from './budget.module.css';

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const AGENTS = [
  {
    id: 'venue',
    name: 'Venue',
    fullName: 'Venue Specialist',
    img: '/assets/udaipur.avif',
    tasks: ['Analysing destination venues', 'Checking 5-star tier rates', 'Calculating 50 rooms'],
  },
  {
    id: 'fnb',
    name: 'Food & Bev',
    fullName: 'F&B Specialist',
    img: '/assets/food.jpg',
    tasks: ['500 guests per-head costs', 'Menu & bar estimation', 'Staffing overhead'],
  },
  {
    id: 'decor',
    name: 'Décor',
    fullName: 'Décor Specialist',
    img: '/assets/decor.jpg',
    tasks: ['Tier 3 complexity analysis', 'Traditional style across 3 events', 'Design cost prediction'],
  },
  {
    id: 'ent',
    name: 'Entertainment',
    fullName: 'Entertainment Specialist',
    img: '/assets/entertainment.jpg',
    tasks: ['Premium tier rates', 'Artist availability check'],
  },
  {
    id: 'logi',
    name: 'Logistics',
    fullName: 'Logistics Specialist',
    img: '/assets/logistics.jpg',
    tasks: ['200 outstation guests', 'Fleet sizing & trips', 'Baraat logistics'],
  },
  {
    id: 'sun',
    name: 'Sundries',
    fullName: 'Sundries Specialist',
    img: '/assets/sundries.jpg',
    tasks: ['50 room amenity baskets', 'Rituals & gifting'],
  },
];

type AgentStatus = 'idle' | 'working' | 'done';

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */

function AgentCard({
  agent,
  status,
  currentTask,
  barPct,
}: {
  agent: typeof AGENTS[0];
  status: AgentStatus;
  currentTask: string;
  barPct: number;
}) {
  return (
    <div className={`${styles.agCard} ${styles[`agCard_${status}`]}`}>
      <div className={styles.agPhoto}>
        <img src={agent.img} alt={agent.name} loading="lazy" />
        <div className={styles.agOverlay} />

        {status === 'working' && <div className={styles.agPulse} />}

        {status === 'done' && (
          <div className={styles.agCheck}>
            <svg viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1.5,5 4,7.5 8.5,2.5" />
            </svg>
          </div>
        )}

        <div className={styles.agBarTrack}>
          <div className={styles.agBarFill} style={{ width: `${barPct}%` }} />
        </div>
      </div>

      <div className={styles.agInfo}>
        <div className={`${styles.agName} ${status === 'working' ? styles.agName_working : status === 'done' ? styles.agName_done : ''}`}>
          {agent.name}
        </div>
        <div className={`${styles.agTask} ${status === 'working' ? styles.agTask_visible : ''}`}>
          {currentTask}
        </div>
      </div>
    </div>
  );
}

function LogRow({ who, msg, isDone }: { who: string; msg: string; isDone: boolean }) {
  return (
    <div className={styles.logRow}>
      <span className={styles.logWho}>{who}</span>
      <span className={`${styles.logMsg} ${isDone ? styles.logMsg_done : ''}`}>
        {isDone ? 'Analysis complete' : msg}
      </span>
    </div>
  );
}

function BudgetCard({
  name, img, low, mid, high, pct, detail,
}: {
  name: string; img: string; low: number; mid: number; high: number; pct: number; detail: string;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.budgetCard}>
      <div className={styles.budgetCardImg}>
        <img src={img} alt={name} loading="lazy" />
        <div className={styles.budgetCardImgOverlay} />
        <div className={styles.budgetCardImgLabel}>{name}</div>
      </div>
      <div className={styles.budgetCardBody}>
        <div className={styles.budgetNums}>
          <div className={styles.budgetNumItem}>
            <span className={styles.numLabel}>Low</span>
            <span className={styles.numVal}>{formatCurrency(low)}</span>
          </div>
          <div className={`${styles.budgetNumItem} ${styles.budgetNumItem_mid}`}>
            <span className={styles.numLabel}>Mid</span>
            <span className={styles.numVal}>{formatCurrency(mid)}</span>
          </div>
          <div className={styles.budgetNumItem}>
            <span className={styles.numLabel}>High</span>
            <span className={styles.numVal}>{formatCurrency(high)}</span>
          </div>
        </div>
        <div className={styles.budgetBar}>
          <div className={styles.budgetBarFill} style={{ width: animated ? `${pct}%` : '0%' }} />
        </div>
        <p className={styles.budgetDetail}>{detail}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function BudgetPage() {
  const { input } = useWizardStore();
  const { setBudget, totalLow, totalMid, totalHigh, confidence, breakdown, hasResults, reset: resetBudget } = useBudgetStore();

  const [phase, setPhase] = useState<'theater' | 'results'>('theater');
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>(
    Object.fromEntries(AGENTS.map(a => [a.id, 'idle']))
  );
  const [agentTasks, setAgentTasks] = useState<Record<string, string>>(
    Object.fromEntries(AGENTS.map(a => [a.id, '']))
  );
  const [agentBars, setAgentBars] = useState<Record<string, number>>(
    Object.fromEntries(AGENTS.map(a => [a.id, 0]))
  );
  const [logRows, setLogRows] = useState<{ id: string; who: string; msg: string; isDone: boolean }[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: AGENTS.length });
  const [allDone, setAllDone] = useState(false);
  const [confAnimated, setConfAnimated] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  const hasStarted = useRef(false);

  // Auto-scroll log
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [logRows]);

  // Animate confidence bar on results mount
  useEffect(() => {
    if (phase === 'results') {
      const t = setTimeout(() => setConfAnimated(true), 200);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Run agent sequence
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    resetBudget();

    const addLog = (who: string, msg: string, isDone: boolean) => {
      setLogRows(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, who, msg, isDone }]);
    };

    const setStatus = (id: string, status: AgentStatus) => {
      setAgentStatuses(prev => ({ ...prev, [id]: status }));
    };
    const setTask = (id: string, task: string) => {
      setAgentTasks(prev => ({ ...prev, [id]: task }));
    };
    const setBar = (id: string, pct: number) => {
      setAgentBars(prev => ({ ...prev, [id]: pct }));
    };

    let delay = 500;

    AGENTS.forEach((agent, idx) => {
      setTimeout(() => {
        setStatus(agent.id, 'working');
        setTask(agent.id, agent.tasks[0]);
        setBar(agent.id, 5);
        addLog(agent.fullName, 'Starting analysis…', false);
      }, delay);
      delay += 600;

      agent.tasks.forEach((task, ti) => {
        if (ti === 0) return;
        setTimeout(() => {
          setTask(agent.id, task);
          addLog(agent.fullName, task, false);
          setBar(agent.id, Math.round((ti / agent.tasks.length) * 85));
        }, delay);
        delay += 850;
      });

      setTimeout(() => {
        setStatus(agent.id, 'done');
        setTask(agent.id, '');
        setBar(agent.id, 100);
        addLog(agent.fullName, '', true);
        setProgress({ done: idx + 1, total: AGENTS.length });

        if (idx === AGENTS.length - 1) {
          setTimeout(() => setAllDone(true), 700);
          // Calculate budget
          calculateLocally();
        }
      }, delay);
      delay += 500;
    });

    function calculateLocally() {
      const baseVenue = input.room_count * 25000 * Math.max(input.events.length - 1, 2);
      const baseFnb = input.guest_count * 2500 * input.events.length;
      const baseDecor = input.events.length * 500000 * (input.decor_complexity / 3);
      const baseArtist = input.entertainment_tier === 'celebrity' ? 5000000 : input.entertainment_tier === 'premium' ? 1500000 : 500000;
      const baseLogistics = Math.ceil(input.guest_count * input.outstation_percentage / 3) * 4500 * 3 + 50000;
      const baseSundries = input.room_count * 1200 + input.guest_count * 500;

      const categories = {
        'Venue & Accommodation': { name: 'Venue & Accommodation', icon: '🏨', img: AGENTS[0].img, low: baseVenue * 0.7, mid: baseVenue, high: baseVenue * 1.5, details: `${input.room_count} rooms in ${input.city || 'destination'}` },
        'Food & Beverage': { name: 'Food & Beverage', icon: '🍽️', img: AGENTS[1].img, low: baseFnb * 0.7, mid: baseFnb, high: baseFnb * 1.4, details: `${input.guest_count} guests, ${input.events.length} events` },
        'Décor & Design': { name: 'Décor & Design', icon: '🎨', img: AGENTS[2].img, low: baseDecor * 0.6, mid: baseDecor, high: baseDecor * 1.6, details: `Tier ${input.decor_complexity}/5, ${input.decor_style}` },
        'Artist & Entertainment': { name: 'Artist & Entertainment', icon: '🎤', img: AGENTS[3].img, low: baseArtist * 0.6, mid: baseArtist, high: baseArtist * 1.5, details: `${input.entertainment_tier} tier` },
        'Logistics & Transport': { name: 'Logistics & Transport', icon: '🚗', img: AGENTS[4].img, low: baseLogistics * 0.7, mid: baseLogistics, high: baseLogistics * 1.4, details: `${Math.round(input.guest_count * input.outstation_percentage)} outstation guests` },
        'Sundries & Basics': { name: 'Sundries & Basics', icon: '🎁', img: AGENTS[5].img, low: baseSundries * 0.7, mid: baseSundries, high: baseSundries * 1.4, details: 'Baskets, rituals, gifts' },
      };

      const total_low = Object.values(categories).reduce((s, c) => s + c.low, 0) * 1.05;
      const total_mid = Object.values(categories).reduce((s, c) => s + c.mid, 0) * 1.05;
      const total_high = Object.values(categories).reduce((s, c) => s + c.high, 0) * 1.05;

      setBudget({ total_low, total_mid, total_high, confidence: 0.82, breakdown: categories });
    }
  }, []);

  const progressPct = (progress.done / progress.total) * 100;

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link href="/wizard" className={styles.navLink}>← Edit Inputs</Link>
        <span className={styles.navLogo}><em>Wedding</em>Budget.ai</span>
        <Link href="/" className={styles.navLink}>Home</Link>
      </nav>

      {/* ── THEATER ── */}
      {phase === 'theater' && (
        <div className={styles.theater}>
          <p className={styles.eyebrow}>Budget Analysis in Progress</p>
          <h1 className={styles.theaterTitle}>Your Planning Suite</h1>
          <p className={styles.theaterSub}>Six specialists working in concert on your celebration</p>

          {/* Agent photo cards */}
          <div className={styles.agGrid}>
            {AGENTS.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                status={agentStatuses[agent.id]}
                currentTask={agentTasks[agent.id]}
                barPct={agentBars[agent.id]}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className={styles.progressWrap}>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
            </div>
            <p className={styles.progressLabel}>
              {progress.done === progress.total
                ? 'All specialists complete'
                : `${progress.done} of ${progress.total} specialists complete`}
            </p>
          </div>

          {/* Live log */}
          <div className={styles.logWrap}>
            <div className={styles.logHeader}>
              <div className={`${styles.logDot} ${allDone ? styles.logDot_done : ''}`} />
              <span className={styles.logTitle}>Live activity feed</span>
            </div>
            <div className={styles.logBody} ref={logRef}>
              {logRows.map(row => (
                <LogRow key={row.id} who={row.who} msg={row.msg} isDone={row.isDone} />
              ))}
            </div>
          </div>

          {/* CTA */}
          {allDone && hasResults && (
            <div className={styles.cta}>
              <div className={styles.ctaLine} />
              <p className={styles.ctaMsg}>Your bespoke budget is ready</p>
              <button className={styles.ctaBtn} onClick={() => setPhase('results')}>
                Reveal Budget &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── RESULTS ── */}
      {phase === 'results' && hasResults && (
        <div className={styles.results}>
          {/* Hero */}
          <div className={styles.resHero}>
            <p className={styles.resEyebrow}>Your Estimated Wedding Budget</p>
            <div className={styles.resRange}>
              <div className={styles.resItem}>
                <span className={styles.resTag}>Conservative</span>
                <span className={styles.resVal}>{formatCurrency(totalLow)}</span>
              </div>
              <div className={`${styles.resItem} ${styles.resItem_mid}`}>
                <span className={styles.resTag}>Recommended</span>
                <span className={styles.resVal}>{formatCurrency(totalMid)}</span>
              </div>
              <div className={styles.resItem}>
                <span className={styles.resTag}>Premium</span>
                <span className={styles.resVal}>{formatCurrency(totalHigh)}</span>
              </div>
            </div>
            <div className={styles.confRow}>
              <span className={styles.confLabel}>AI Confidence</span>
              <div className={styles.confTrack}>
                <div className={styles.confFill} style={{ width: confAnimated ? `${confidence * 100}%` : '0%' }} />
              </div>
              <span className={styles.confLabel}>{Math.round(confidence * 100)}%</span>
            </div>
          </div>

          {/* Category breakdown */}
          <div className={styles.catsGrid}>
            {Object.values(breakdown).map((cat, i) => (
              <BudgetCard
                key={cat.name}
                name={cat.name}
                img={(cat as any).img || AGENTS[i % AGENTS.length].img}
                low={cat.low}
                mid={cat.mid}
                high={cat.high}
                pct={Math.round((cat.mid / cat.high) * 100)}
                detail={cat.details}
              />
            ))}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={() => setPhase('theater')}>
              Back to Analysis
            </button>
            <Link href="/wizard" className={styles.btnSecondary}>
              Modify Inputs
            </Link>
            <button className={styles.btnSecondary} onClick={() => alert('PDF export coming soon!')}>
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}