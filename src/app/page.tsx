'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

/* ═══════════════ Bottom Navigation (Figma: 5 tabs) ═══════════════ */
function BottomNav() {
  return (
    <nav className="bottom-nav show-mobile">
      <Link href="/" className="bottom-nav-item active">
        <svg className="bottom-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>
        Home
      </Link>
      <Link href="/wizard" className="bottom-nav-item">
        <svg className="bottom-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
        Plan
      </Link>
      <Link href="/budget" className="bottom-nav-item">
        <svg className="bottom-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8 10h8M8 14h8"/></svg>
        Budget
      </Link>
      <Link href="/decor-library" className="bottom-nav-item">
        <svg className="bottom-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Inspire
      </Link>
      <Link href="/admin" className="bottom-nav-item">
        <svg className="bottom-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Settings
      </Link>
    </nav>
  );
}

/* ═══════════════ Stat Counter ═══════════════ */
function StatCounter({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { requestAnimationFrame(animate); observer.disconnect(); }
    }, { threshold: 0.5 });
    const el = document.getElementById(`stat-${label.replace(/\s/g, '')}`);
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [value, label]);

  return (
    <div className={styles.stat} id={`stat-${label.replace(/\s/g, '')}`}>
      <div className={styles.statValue}>{count}{suffix}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

/* ═══════════════ Main Landing Page ═══════════════ */
export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 200); }, []);

  return (
    <main className={styles.main}>
      {/* Desktop Nav */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>WeddingBudget<span>.ai</span></div>
          <nav className={styles.desktopNav}>
            <Link href="/wizard">Plan Wedding</Link>
            <Link href="/budget">Budget</Link>
            <Link href="/decor-library">Inspiration</Link>
            <Link href="/admin">Admin</Link>
          </nav>
          <Link href="/wizard" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.8125rem' }}>
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={`${styles.heroContent} ${loaded ? styles.heroVisible : ''}`}>
          <span className={styles.badge}>AI-Powered Wedding Intelligence</span>

          <h1 className={styles.heroTitle}>
            Plan the wedding<br />
            <span className={styles.heroHighlight}>of your dreams</span><br />
            without going over budget
          </h1>

          <p className={styles.heroSubtitle}>
            India&apos;s first AI-powered wedding budget estimator. Six intelligent agents
            analyze venue, decor, catering and more — delivering accurate, itemized estimates.
          </p>

          <div className={styles.heroCTA}>
            <Link href="/wizard" className="btn-primary">
              Start Planning
            </Link>
            <Link href="/decor-library" className="btn-secondary">
              Browse Inspiration
            </Link>
          </div>
        </div>

        <div className={`${styles.heroImage} ${loaded ? styles.heroVisible : ''}`}>
          <div className={styles.archFrame}>
            <img
              src="https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=600&q=80"
              alt="Beautifully decorated Indian wedding mandap"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsBar}>
        <div className={styles.statsInner}>
          <StatCounter value={50} label="Cities" suffix="+" />
          <div className={styles.statDivider} />
          <StatCounter value={10000} label="Decor References" suffix="+" />
          <div className={styles.statDivider} />
          <StatCounter value={6} label="AI Agents" />
          <div className={styles.statDivider} />
          <StatCounter value={95} label="Accuracy" suffix="%" />
        </div>
      </section>

      {/* How it Works */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="text-accent">How It Works</span>
            <h2 className="heading-section">Your Wedding, Simplified</h2>
            <div className="section-divider" />
          </div>

          <div className={styles.stepsGrid}>
            {[
              { num: '01', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80', title: 'Tell Us Your Vision', desc: 'Select city, venue type, guest count, and events through our guided wizard.' },
              { num: '02', img: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=80', title: 'Choose Your Style', desc: 'Browse decor styles, set entertainment preferences, and food & beverage options.' },
              { num: '03', img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&q=80', title: 'AI Agents Analyze', desc: 'Watch six specialized agents calculate your budget categories in real-time.' },
              { num: '04', img: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400&q=80', title: 'Get Your Budget', desc: 'Receive itemized Low / Mid / High estimates with a downloadable PDF report.' },
            ].map((step, i) => (
              <div key={i} className={styles.stepCard}>
                <div className={styles.stepImageWrap}>
                  <img src={step.img} alt={step.title} loading="lazy" />
                  <span className={styles.stepNum}>{step.num}</span>
                </div>
                <div className={styles.stepText}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="text-accent">Your AI Team</span>
            <h2 className="heading-section">Meet Your Planning Agents</h2>
            <div className="section-divider" />
          </div>

          <div className={styles.agentsGrid}>
            {[
              { icon: '/icons/venue.svg', name: 'Venue Agent', desc: 'Analyzes hotel rates across top Indian wedding destinations', color: '#9A2143' },
              { icon: '/icons/fnb.svg', name: 'F&B Agent', desc: 'Calculates per-head costs for menus, bar setups, and catering', color: '#BFA054' },
              { icon: '/icons/decor.svg', name: 'Decor Agent', desc: 'AI image analysis to predict decor costs by style and complexity', color: '#8B5E3C' },
              { icon: '/icons/artist.svg', name: 'Artist Agent', desc: 'Maps entertainment costs from local DJs to celebrity performers', color: '#4A6741' },
              { icon: '/icons/logistics.svg', name: 'Logistics Agent', desc: 'Guest transfers, fleet sizing, Baraat logistics, and special effects', color: '#4A5568' },
              { icon: '/icons/sundries.svg', name: 'Sundries Agent', desc: 'Room baskets, ritual materials, gifts, and contingency budgeting', color: '#7C3AED' },
            ].map((agent, i) => (
              <div key={i} className={styles.agentCard} style={{ animationDelay: `${i * 80}ms` }}>
                <div className={styles.agentIconWrap} style={{ backgroundColor: `${agent.color}12` }}>
                  <div className={styles.agentInitial} style={{ color: agent.color }}>
                    {agent.name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className={styles.agentName}>{agent.name}</h3>
                  <p className={styles.agentDesc}>{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="text-accent">Why Choose Us</span>
            <h2 className="heading-section">Built for Indian Weddings</h2>
            <div className="section-divider" />
          </div>

          <div className={styles.featuresGrid}>
            {[
              { title: 'City-Specific Pricing', desc: 'Udaipur costs differ from Mumbai. Our agents price by destination.' },
              { title: 'Human-in-the-Loop', desc: 'Approve or override AI estimates at every step of the process.' },
              { title: 'Mobile Responsive', desc: 'Plan your wedding from anywhere, on any device.' },
              { title: 'Scenario Comparison', desc: '5-star vs resort, 500 guests vs 300 — compare instantly.' },
              { title: 'PDF Report Export', desc: 'Download professional, branded budget reports.' },
              { title: 'Admin Controls', desc: 'Seed costs, label decor references, manage artist databases.' },
            ].map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaBox}>
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80"
              alt="Elegant wedding reception setup"
              className={styles.ctaImage}
              loading="lazy"
            />
            <div className={styles.ctaContent}>
              <span className="text-accent">Ready to Begin?</span>
              <h2 className="heading-section" style={{ marginTop: 4 }}>
                Plan your dream<br />wedding budget
              </h2>
              <p className={styles.ctaDesc}>
                Join thousands of couples and wedding planners who trust AI for their most special day.
              </p>
              <Link href="/wizard" className="btn-primary">
                Start Your Free Estimate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div>
              <div className={styles.footerLogo}>WeddingBudget.ai</div>
              <p className={styles.footerTag}>AI-powered wedding budget estimation</p>
            </div>
            <div className={styles.footerLinks}>
              <Link href="/wizard">Budget Wizard</Link>
              <Link href="/decor-library">Inspiration Library</Link>
              <Link href="/admin">Admin Panel</Link>
            </div>
            <p className={styles.footerCopy}>Team 404 Dulhan Not Found | WedTech Innovation Challenge 2025</p>
          </div>
        </div>
      </footer>

      <BottomNav />
    </main>
  );
}
