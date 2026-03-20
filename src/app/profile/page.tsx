'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import styles from './profile.module.css';

/* ═══════════ SVG Icons ═══════════ */
const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
);

const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 10h20" /><circle cx="17" cy="14" r="1.5" /></svg>
);

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
);

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 14l2 2 4-4" /></svg>
);

const GalleryIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);

/* ═══════════ Bottom Navigation ═══════════ */
function BottomNav() {
  const role = useAuthStore((s) => s.role);
  return (
    <nav className="bottom-nav show-mobile">
      <Link href="/" className="bottom-nav-item">
        <svg className="bottom-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg>
        Home
      </Link>
      <Link href="/wizard" className="bottom-nav-item">
        <svg className="bottom-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 14l2 2 4-4" /></svg>
        Plan
      </Link>
      <Link href="/budget" className="bottom-nav-item">
        <svg className="bottom-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v12M8 10h8M8 14h8" /></svg>
        Budget
      </Link>
      <Link href="/decor-library" className="bottom-nav-item">
        <svg className="bottom-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
        Inspire
      </Link>
      {role === 'admin' ? (
        <Link href="/admin" className="bottom-nav-item">
          <svg className="bottom-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          Admin
        </Link>
      ) : (
        <Link href="/profile" className="bottom-nav-item active">
          <svg className="bottom-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          Profile
        </Link>
      )}
    </nav>
  );
}

/* ═══════════ Sample Data ═══════════ */
const sampleTasks = [
  { id: 1, text: 'Finalize guest list', priority: 'high', done: true },
  { id: 2, text: 'Book photographer & videographer', priority: 'high', done: false },
  { id: 3, text: 'Select wedding invitation design', priority: 'medium', done: false },
  { id: 4, text: 'Plan mehendi ceremony menu', priority: 'medium', done: false },
  { id: 5, text: 'Arrange welcome hampers', priority: 'low', done: false },
];

/* ═══════════ Main Profile Page ═══════════ */
export default function ProfilePage() {
  const router = useRouter();
  const { role, displayName, logout } = useAuthStore();
  const [tasks, setTasks] = useState(sampleTasks);

  const toggleTask = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const completedCount = tasks.filter(t => t.done).length;

  return (
    <div className={styles.profilePage}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarTitle}>WeddingBudget<span>.ai</span></div>
        <div className={styles.topRight}>
          {role === 'admin' && <span className={styles.adminBadge}>Admin</span>}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogoutIcon /> Logout
          </button>
        </div>
      </div>

      {/* Hero Banner — minimal */}
      <div className={styles.heroBanner}>
        <div className={styles.heroInner}>
          <h1 className={styles.greeting}>Hello, {displayName}!</h1>
          <p className={styles.greetingSub}>Add a detailed profile to get personalised suggestions</p>
          <button className={styles.setupBtn}>
            <EditIcon /> Set up Profile
          </button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className={styles.dashGrid}>
        {/* Upcoming Events */}
        <div className={`${styles.dashCard} ${styles.dashCardFull}`} style={{ animationDelay: '0.05s' }}>
          <div className={styles.cardHeaderRow}>
            <div>
              <div className={styles.cardLabel}>Upcoming</div>
              <div className={styles.cardTitle}>Food Tasting</div>
            </div>
            <Link href="/wizard" className={styles.cardLink}>View All →</Link>
          </div>
          <div className={styles.eventItem}>
            <div className={styles.eventIcon}><CalendarIcon /></div>
            <div className={styles.eventDetails}>
              <div className={styles.eventName}>Food Tasting</div>
              <div className={styles.eventDate}>12 June, Monday · 12:30 pm · F9 Caterers</div>
            </div>
            <div className={styles.eventActions}>
              <button className={styles.eventActionBtn}><ChatIcon /></button>
              <button className={styles.eventActionBtn}><UsersIcon /></button>
            </div>
          </div>
        </div>

        {/* Wedding Countdown */}
        <div className={styles.dashCard} style={{ animationDelay: '0.1s' }}>
          <div className={styles.cardLabel}>Wedding</div>
          <div className={styles.countdownWrap}>
            <div style={{ color: 'var(--gold)', marginBottom: 4 }}><HeartIcon /></div>
            <span className={styles.countdownValue}>163</span>
            <span className={styles.countdownUnit}> Days</span>
            <div className={styles.countdownDate}>09/05/2026</div>
          </div>
        </div>

        {/* Budget Summary */}
        <div className={styles.dashCard} style={{ animationDelay: '0.15s' }}>
          <div className={styles.cardLabel}>Budget</div>
          <div className={styles.budgetWrap}>
            <span className={styles.budgetPercent}>41</span>
            <span className={styles.budgetUnit}>% Spent</span>
            <div className={styles.budgetBar}>
              <div className={styles.budgetBarFill} style={{ width: '41%' }} />
            </div>
            <div className={styles.budgetAmount}>₹12,34,11 of ₹25 lakhs</div>
          </div>
        </div>

        {/* Tasks */}
        <div className={`${styles.dashCard} ${styles.dashCardFull}`} style={{ animationDelay: '0.2s' }}>
          <div className={styles.cardHeaderRow}>
            <div>
              <div className={styles.cardLabel}>Tasks</div>
              <div className={styles.cardTitle}>Wedding Checklist</div>
            </div>
            <span className={styles.cardLink}>{completedCount}/{tasks.length} Done</span>
          </div>
          <div className={styles.tasksList}>
            {tasks.map(task => (
              <div key={task.id} className={styles.taskItem}>
                <div
                  className={`${styles.taskCheckbox} ${task.done ? styles.checked : ''}`}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.done && <CheckIcon />}
                </div>
                <span className={`${styles.taskText} ${task.done ? styles.completed : ''}`}>{task.text}</span>
                <span className={`${styles.taskPriority} ${
                  task.priority === 'high' ? styles.priorityHigh :
                  task.priority === 'medium' ? styles.priorityMedium : styles.priorityLow
                }`}>{task.priority}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2 className={styles.quickActionsTitle}>Quick Actions</h2>
        <div className={styles.quickActionsGrid}>
          <Link href="/wizard" className={styles.quickActionCard}>
            <div className={styles.quickActionIcon} style={{ background: 'rgba(154,33,67,0.06)', color: 'var(--maroon)' }}><ClipboardIcon /></div>
            <span className={styles.quickActionLabel}>Plan</span>
          </Link>
          <Link href="/budget" className={styles.quickActionCard}>
            <div className={styles.quickActionIcon} style={{ background: 'rgba(191,160,84,0.1)', color: 'var(--gold-dark)' }}><WalletIcon /></div>
            <span className={styles.quickActionLabel}>Budget</span>
          </Link>
          <Link href="/decor-library" className={styles.quickActionCard}>
            <div className={styles.quickActionIcon} style={{ background: 'rgba(46,139,87,0.06)', color: 'var(--emerald)' }}><GalleryIcon /></div>
            <span className={styles.quickActionLabel}>Inspire</span>
          </Link>
          {role === 'admin' ? (
            <Link href="/admin" className={styles.quickActionCard}>
              <div className={styles.quickActionIcon} style={{ background: 'rgba(74,144,217,0.06)', color: 'var(--sky)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              </div>
              <span className={styles.quickActionLabel}>Admin</span>
            </Link>
          ) : (
            <Link href="/login" className={styles.quickActionCard}>
              <div className={styles.quickActionIcon} style={{ background: 'rgba(74,144,217,0.06)', color: 'var(--sky)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
              </div>
              <span className={styles.quickActionLabel}>Login</span>
            </Link>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
