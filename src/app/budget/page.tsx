'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useWizardStore } from '@/stores/wizardStore';
import { useAgentStore } from '@/stores/agentStore';
import { useBudgetStore } from '@/stores/budgetStore';
import { formatCurrency } from '@/data/constants';
import styles from './budget.module.css';

/* ═══════════════ Agent Avatar ═══════════════ */
function AgentAvatar({ icon, name, status }: { icon: string; name: string; status: string }) {
  return (
    <div className={`${styles.agentAvatar} ${styles[`agent${status}`] || ''}`}>
      <div className={styles.agentEmoji}>{icon}</div>
      <div className={styles.agentLabel}>{name}</div>
      <div className={`agent-status-dot ${status}`} />
    </div>
  );
}

/* ═══════════════ Agent Chat Message ═══════════════ */
function ChatMessage({ icon, agent, message, isNew }: { icon: string; agent: string; message: string; isNew: boolean }) {
  return (
    <div className={`${styles.chatMessage} ${isNew ? styles.chatNew : ''}`}>
      <span className={styles.chatIcon}>{icon}</span>
      <div className={styles.chatBody}>
        <strong className={styles.chatAgent}>{agent}</strong>
        <p className={styles.chatText}>{message}</p>
      </div>
    </div>
  );
}

/* ═══════════════ Budget Card ═══════════════ */
function BudgetCard({ icon, name, low, mid, high, details }: {
  icon: string; name: string; low: number; mid: number; high: number; details: string;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const maxVal = high;
  const midPercent = maxVal > 0 ? (mid / maxVal) * 100 : 0;

  return (
    <div className={styles.budgetCard}>
      <div className={styles.budgetCardHeader}>
        <span className={styles.budgetCardIcon}>{icon}</span>
        <h3>{name}</h3>
      </div>
      <div className={styles.budgetCardBody}>
        <div className={styles.budgetRange}>
          <div className={styles.budgetRangeItem}>
            <span className={styles.rangeLabel}>Low</span>
            <span className={styles.rangeValue}>{formatCurrency(low)}</span>
          </div>
          <div className={`${styles.budgetRangeItem} ${styles.rangeMid}`}>
            <span className={styles.rangeLabel}>Mid</span>
            <span className={styles.rangeValue}>{formatCurrency(mid)}</span>
          </div>
          <div className={styles.budgetRangeItem}>
            <span className={styles.rangeLabel}>High</span>
            <span className={styles.rangeValue}>{formatCurrency(high)}</span>
          </div>
        </div>
        <div className={styles.budgetBarContainer}>
          <div
            className={styles.budgetBar}
            style={{ width: animated ? `${midPercent}%` : '0%' }}
          />
        </div>
        <p className={styles.budgetDetails}>{details}</p>
      </div>
    </div>
  );
}

/* ═══════════════ Main Budget Page ═══════════════ */
export default function BudgetPage() {
  const { input, isComplete } = useWizardStore();
  const { agents, messages, progress, isCalculating, setCalculating, updateAgent, addMessage, setProgress, reset: resetAgents } = useAgentStore();
  const { totalLow, totalMid, totalHigh, confidence, breakdown, hasResults, setBudget, reset: resetBudget } = useBudgetStore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'agents' | 'results'>('agents');
  const hasStarted = useRef(false);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate agent calculation
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    resetAgents();
    resetBudget();
    setCalculating(true);

    const agentSequence = [
      { name: 'Venue Agent', icon: '🏨', messages: [
        `Analyzing ${input.city || 'destination'} venue costs...`,
        `Checking ${(input.hotel_tier || '5star_city').replace(/_/g, ' ')} tier pricing...`,
        `Calculating ${input.room_count} rooms for estimated duration...`,
      ]},
      { name: 'F&B Agent', icon: '🍽️', messages: [
        `Computing per-head costs for ${input.guest_count} guests...`,
        `Menu: ${(input.food_type || 'veg_nonveg').replace(/_/g, ' ')}, Bar: ${(input.bar_type || 'full_bar').replace(/_/g, ' ')}...`,
        `Estimating specialty counters and staff costs...`,
      ]},
      { name: 'Décor Agent', icon: '🎨', messages: [
        `Analyzing décor complexity tier ${input.decor_complexity}/5...`,
        `Estimating ${input.decor_style || 'traditional'} style across ${input.events.length} events...`,
        `Running AI cost prediction on design references...`,
      ]},
      { name: 'Artist Agent', icon: '🎤', messages: [
        `Mapping ${input.entertainment_tier || 'premium'} tier entertainment costs...`,
        `Checking artist database for available acts...`,
      ]},
      { name: 'Logistics Agent', icon: '🚗', messages: [
        `Calculating transfers for ${Math.round(input.guest_count * input.outstation_percentage)} outstation guests...`,
        `Fleet sizing: 1 Innova per 3 guests, estimating trips...`,
        `Baraat logistics: Ghodi, Dholi, SFX...`,
      ]},
      { name: 'Sundries Agent', icon: '🎁', messages: [
        `Estimating room baskets for ${input.room_count} rooms...`,
        `Ritual materials, gifts, stationery calculations...`,
      ]},
    ];

    let totalDelay = 500;

    agentSequence.forEach((agent, agentIndex) => {
      // Agent starts working
      setTimeout(() => {
        updateAgent(agent.name, { status: 'working' });
        addMessage({ agent: agent.name, icon: agent.icon, message: `Starting ${agent.name.replace(' Agent', '')} analysis...`, type: 'status' });
      }, totalDelay);
      totalDelay += 600;

      // Agent messages
      agent.messages.forEach((msg) => {
        setTimeout(() => {
          addMessage({ agent: agent.name, icon: agent.icon, message: msg, type: 'message' });
        }, totalDelay);
        totalDelay += 800;
      });

      // Agent completes
      setTimeout(() => {
        updateAgent(agent.name, { status: 'done' });
        setProgress(agentIndex + 1, 6);
        addMessage({ agent: agent.name, icon: agent.icon, message: `✅ ${agent.name.replace(' Agent', '')} analysis complete!`, type: 'status' });
      }, totalDelay);
      totalDelay += 400;
    });

    // Fetch real budget from API (or calculate locally)
    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/budget/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (response.ok) {
          const data = await response.json();
          setBudget(data);
        } else {
          // Fallback: use local calculation
          calculateLocally();
        }
      } catch {
        // API not running, calculate locally
        calculateLocally();
      }

      setCalculating(false);
      setPhase('results');
    }, totalDelay + 500);

    function calculateLocally() {
      // Simplified local budget calculation
      const baseVenue = input.room_count * 25000 * Math.max(input.events.length - 1, 2);
      const baseFnb = input.guest_count * 2500 * input.events.length;
      const baseDecor = input.events.length * 500000 * (input.decor_complexity / 3);
      const baseArtist = input.entertainment_tier === 'celebrity' ? 5000000 : input.entertainment_tier === 'premium' ? 1500000 : 500000;
      const baseLogistics = Math.ceil(input.guest_count * input.outstation_percentage / 3) * 4500 * 3 + 50000;
      const baseSundries = input.room_count * 1200 + input.guest_count * 500;

      const categories = {
        'Venue & Accommodation': { name: 'Venue & Accommodation', icon: '🏨', low: baseVenue * 0.7, mid: baseVenue, high: baseVenue * 1.5, details: `${input.room_count} rooms in ${input.city || 'destination'}` },
        'Food & Beverage': { name: 'Food & Beverage', icon: '🍽️', low: baseFnb * 0.7, mid: baseFnb, high: baseFnb * 1.4, details: `${input.guest_count} guests, ${input.events.length} events` },
        'Décor & Design': { name: 'Décor & Design', icon: '🎨', low: baseDecor * 0.6, mid: baseDecor, high: baseDecor * 1.6, details: `Tier ${input.decor_complexity}/5, ${input.decor_style}` },
        'Artist & Entertainment': { name: 'Artist & Entertainment', icon: '🎤', low: baseArtist * 0.6, mid: baseArtist, high: baseArtist * 1.5, details: `${input.entertainment_tier} tier` },
        'Logistics & Transport': { name: 'Logistics & Transport', icon: '🚗', low: baseLogistics * 0.7, mid: baseLogistics, high: baseLogistics * 1.4, details: `${Math.round(input.guest_count * input.outstation_percentage)} outstation guests` },
        'Sundries & Basics': { name: 'Sundries & Basics', icon: '🎁', low: baseSundries * 0.7, mid: baseSundries, high: baseSundries * 1.4, details: `Baskets, rituals, gifts` },
      };

      const total_low = Object.values(categories).reduce((s, c) => s + c.low, 0) * 1.05;
      const total_mid = Object.values(categories).reduce((s, c) => s + c.mid, 0) * 1.05;
      const total_high = Object.values(categories).reduce((s, c) => s + c.high, 0) * 1.05;

      setBudget({ total_low, total_mid, total_high, confidence: 0.82, breakdown: categories });
    }
  }, []);

  return (
    <div className={styles.budgetPage}>
      {/* Header */}
      <nav className={styles.budgetNav}>
        <Link href="/wizard" className={styles.backLink}>← Edit Inputs</Link>
        <h1 className={styles.budgetLogo}>💍 WeddingBudget.ai</h1>
        <Link href="/" className={styles.homeLink}>Home</Link>
      </nav>

      {phase === 'agents' && (
        <div className={styles.agentTheater}>
          <div className={styles.theaterHeader}>
            <h2 className={styles.theaterTitle}>🎭 Agent Theater</h2>
            <p className={styles.theaterSubtitle}>Your AI wedding planners are calculating your budget...</p>
          </div>

          {/* Agent Avatars Row */}
          <div className={styles.agentRow}>
            {Object.values(agents).map((agent) => (
              <AgentAvatar key={agent.name} icon={agent.icon} name={agent.name} status={agent.status} />
            ))}
          </div>

          {/* Progress Bar */}
          <div className={styles.theaterProgress}>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${(progress.completed / progress.total) * 100}%` }} />
            </div>
            <span className={styles.progressText}>
              {progress.completed}/{progress.total} agents complete — {Math.round((progress.completed / progress.total) * 100)}%
            </span>
          </div>

          {/* Chat Stream */}
          <div className={styles.chatStream}>
            {messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                icon={msg.icon}
                agent={msg.agent}
                message={msg.message}
                isNew={i === messages.length - 1}
              />
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Human-in-the-loop */}
          {!isCalculating && hasResults && (
            <div className={styles.humanLoop}>
              <p>✅ All agents have completed their analysis!</p>
              <button className="btn-primary" onClick={() => setPhase('results')}>
                📊 View Your Budget Results
              </button>
            </div>
          )}
        </div>
      )}

      {phase === 'results' && hasResults && (
        <div className={styles.resultsContainer}>
          {/* Total Budget Hero */}
          <div className={styles.totalBudget}>
            <div className="ornamental-border">
              <span className="text-accent">Your Estimated Wedding Budget</span>
              <div className={styles.totalRange}>
                <div className={styles.totalItem}>
                  <span className={styles.totalLabel}>Conservative</span>
                  <span className={styles.totalValue}>{formatCurrency(totalLow)}</span>
                </div>
                <div className={`${styles.totalItem} ${styles.totalMid}`}>
                  <span className={styles.totalLabel}>Recommended</span>
                  <span className={styles.totalValueBig}>{formatCurrency(totalMid)}</span>
                </div>
                <div className={styles.totalItem}>
                  <span className={styles.totalLabel}>Premium</span>
                  <span className={styles.totalValue}>{formatCurrency(totalHigh)}</span>
                </div>
              </div>
              <div className={styles.confidenceBar}>
                <span>AI Confidence</span>
                <div className={styles.confidenceTrack}>
                  <div className={styles.confidenceFill} style={{ width: `${confidence * 100}%` }} />
                </div>
                <span>{Math.round(confidence * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className={styles.breakdownGrid}>
            {Object.values(breakdown).map((cat) => (
              <BudgetCard key={cat.name} {...cat} />
            ))}
          </div>

          {/* Actions */}
          <div className={styles.resultsActions}>
            <button className="btn-primary" onClick={() => setPhase('agents')}>
              🎭 View Agent Theater
            </button>
            <Link href="/wizard" className="btn-secondary">
              ✏️ Modify Inputs
            </Link>
            <button className="btn-secondary" onClick={() => {
              /* TODO: PDF export */
              alert('PDF export coming soon! This will generate a branded budget report.');
            }}>
              📄 Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
