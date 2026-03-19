'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

/* ═══════════════ Bottom Navigation (Figma: 5 tabs) ═══════════════ */
function BottomNav() {
  return (
    <nav className="bottom-nav show-mobile">
      <Link href="/" className="bottom-nav-item active">
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
      <Link href="/admin" className="bottom-nav-item">
        <svg className="bottom-nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
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

const t = {
  en: {
    navPlan: "Plan Wedding",
    navBudget: "Budget",
    navInspire: "Inspiration",
    navAdmin: "Admin",
    heroTitle: <>Plan the wedding<br /><span className={`${styles.heroHighlight} ${styles.fontItalic}`}>of your dreams</span><br />without going over budget</>,
    heroSubtitle: "India's first multi agent AI-powered wedding budget estimator. Six intelligent agents analyze venue, decor, catering and more — delivering accurate, itemized estimates.",
    startPlanning: "Start Planning",
    browseInspiration: "Browse Inspiration",
    howItWorks: "How It Works",
    yourWeddingSimplified: "Your Wedding, Simplified",
    yourTeam: "Your Team",
    meetAgents: "Meet Your Planning Agents",
    bundles: "Customizable Bundles",
    interactionPacks: "Agent Interaction Packs",
    whyChooseUs: "Why Choose Us",
    builtForIndian: "Built for Indian Weddings",
    readyToBegin: "Ready to Begin?",
    startFree: "Start Your Free Estimate",
  },
  hi: {
    navPlan: "वेडिंग प्लान",
    navBudget: "बजट",
    navInspire: "प्रेरणा",
    navAdmin: "व्यवस्थापक",
    heroTitle: <>अपने <span className={styles.fontItalic}>सपनों की शादी</span><br /><span className={styles.heroHighlight}>की योजना बनाएं</span><br />अपने बजट के भीतर</>,
    heroSubtitle: "भारत का पहला एआई-पावर्ड वेडिंग बजट एस्टीमेटर। छह बुद्धिमान एजेंट वेन्यू, सजावट, केटरिंग और अधिक का विश्लेषण करते हैं — सटीक, विस्तृत अनुमान प्रदान करते हुए।",
    startPlanning: "योजना शुरू करें",
    browseInspiration: "प्रेरणा खोजें",
    howItWorks: "यह कैसे काम करता है",
    yourWeddingSimplified: "आपकी शादी, सरल बनाई गई",
    yourTeam: "आपकी टीम",
    meetAgents: "अपने प्लानिंग एजेंट्स से मिलें",
    bundles: "अनुकूलन योग्य बंडल",
    interactionPacks: "एजेंट इंटरैक्शन पैक्स",
    whyChooseUs: "हमें क्यों चुनें",
    builtForIndian: "भारतीय शादियों के लिए निर्मित",
    readyToBegin: "शुरू करने के लिए तैयार हैं?",
    startFree: "अपना मुफ्त अनुमान शुरू करें",
  }
};

const SectionOrnament = () => (
  <svg className={styles.sectionOrnament} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const FeatureIcons = [
  // Location / City
  <svg key="1" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  // Human in loop / User check
  <svg key="2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>,
  // Mobile / Smartphone
  <svg key="3" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>,
  // Scenario / Compare
  <svg key="4" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>,
  // Export / Download
  <svg key="5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
];

const FeatureIcon = ({ index }: { index: number }) => (
  <div className={styles.featureIconWrap}>
    {FeatureIcons[index]}
  </div>
);

const PackIcon = ({ type }: { type: number }) => (
  <div className={styles.packIconWrap}>
    {type === 1 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--maroon)" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>}
    {type === 2 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--maroon)" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>}
    {type === 3 && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--maroon)" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>}
  </div>
);

/* ═══════════════ Main Landing Page ═══════════════ */
export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const d = t[lang];

  useEffect(() => { setTimeout(() => setLoaded(true)); }, []);

  return (
    <main className={styles.main}>
      {/* Floating Elements */}
      <div className={styles.floatingWidgets}>
        <div className={styles.chatWidget}>
          <img src="/boticon.png" alt="Chat with AI" className={styles.floatingIconExtraLarge} />
        </div>
      </div>

      {/* Desktop Nav */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>WeddingBudget<span>.ai</span></div>
          <nav className={styles.desktopNav}>
            <Link href="/wizard">{d.navPlan}</Link>
            <Link href="/budget">{d.navBudget}</Link>
            <Link href="/decor-library">{d.navInspire}</Link>
            <Link href="/admin">{d.navAdmin}</Link>
          </nav>
          <div className={styles.headerActions}>
            <select className={styles.langSelect} value={lang} onChange={e => setLang(e.target.value as 'en' | 'hi')}>
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
            <Link href="/wizard" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8125rem' }}>
              {lang === 'hi' ? 'शुरू करें' : 'Get Started'}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroParticles}>
          {loaded && Array.from({ length: 100 }).map((_, i) => (
            <span key={i} className={styles.particleLight} style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${10 + Math.random() * 5}s`
            }} />
          ))}
        </div>

        <div className={`${styles.heroContent} ${loaded ? styles.heroVisible : ''}`}>
          <h1 className={styles.heroTitle}>
            {d.heroTitle}
          </h1>

          <p className={styles.heroSubtitle}>
            {d.heroSubtitle}
          </p>

          <div className={styles.heroCTA}>
            <Link href="/wizard" className="btn-primary">
              {d.startPlanning}
            </Link>
            <Link href="/decor-library" className="btn-secondary">
              {d.browseInspiration}
            </Link>
          </div>
        </div>

        <img src="/hero_icon.png" alt="" className={styles.heroRightFloatingIcon} />


      </section>

      {/* Stats */}
      <section className={styles.statsBar}>
        <div className={styles.statsInner}>
          <StatCounter value={50} label="Cities" suffix="+" />
          <div className={styles.statDivider} />
          <StatCounter value={10000} label="Decor References" suffix="+" />
          <div className={styles.statDivider} />
          <StatCounter value={6} label="AI Agents" />
        </div>
      </section>

      {/* How it Works */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="text-accent">{d.howItWorks}</span>
            <h2 className="heading-section">
              {d.yourWeddingSimplified}
            </h2>
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
            <span className="text-accent">{d.yourTeam}</span>
            <h2 className="heading-section">
              {d.meetAgents}
            </h2>
            <div className="section-divider" />
          </div>

          <div className={styles.agentsGrid}>
            {[
              { img: '/mahal-agent.png', name: 'Mahal Agent (Venue)', desc: 'Analyzes hotel rates across top Indian wedding destinations', color: '#9A2143' },
              { img: '/basket.png', name: 'Dawat Agent (Catering)', desc: 'Calculates per-head costs for menus, bar setups, and catering', color: '#BFA054' },
              { img: '/decor-agent.png', name: 'Sajawat Agent (Decor)', desc: 'AI image analysis to predict decor costs by style and complexity', color: '#8B5E3C' },
              { img: '/sangeet-agent.png', name: 'Sangeet Agent (Artists)', desc: 'Maps entertainment costs from local DJs to celebrity performers', color: '#4A6741' },
              { img: '/travel-icon.png', name: 'Safar Agent (Logistics)', desc: 'Guest transfers, fleet sizing, Baraat logistics, and special effects', color: '#4A5568' },
              { img: '/shagun-agent.jpg', name: 'Shagun Agent (Sundries)', desc: 'Room baskets, ritual materials, gifts, and contingency budgeting', color: '#7C3AED' },
            ].map((agent, i) => (
              <div key={i} className={styles.agentCard} style={{ animationDelay: `${i * 80}ms` }}>
                <div className={styles.agentImageWrap} style={{ borderColor: `${agent.color}40` }}>
                  <img src={agent.img} alt={agent.name} className={styles.agentImage} />
                </div>
                <div className={styles.agentTextWrap}>
                  <h3 className={styles.agentName}>{agent.name}</h3>
                  <p className={styles.agentDesc}>{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Packs */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="text-accent">{d.bundles}</span>
            <h2 className="heading-section">
              {d.interactionPacks}
            </h2>
            <div className="section-divider" />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 600, margin: '0 auto' }}>
              Only need help with certain parts of your wedding? Talk specifically to the agents you need.
            </p>
          </div>

          <div className={styles.packsGrid}>
            {[
              { title: 'Full Shaadi Pack', agents: 'End to End Plan', desc: 'End-to-end budget estimation for your entire destination wedding.', recommended: true, icon: 1 },
              { title: 'Decor & Food Pack', agents: 'Sajawat + Dawat', desc: 'Perfect if you already have a venue but need help pricing the core events.', recommended: false, icon: 2 },
              { title: 'Venue Only Pack', agents: 'Mahal Agent', desc: 'Focus strictly on comparing room nights and venue blocks across hotels.', recommended: false, icon: 3 },
            ].map((pack, i) => (
              <div key={i} className={`${styles.packCard} ${pack.recommended ? styles.packRecommended : ''}`}>
                {pack.recommended && <div className={styles.packBadge}>Most Popular</div>}
                <PackIcon type={pack.icon} />
                <h3 className={styles.packTitle}>{pack.title}</h3>
                <div className={styles.packAgents}>{pack.agents}</div>
                <p className={styles.packDesc}>{pack.desc}</p>
                <button className={`btn-primary ${styles.packBtn}`}>Select Pack</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHead}>
            <span className="text-accent">{d.whyChooseUs}</span>
            <h2 className="heading-section">
              {d.builtForIndian}
            </h2>
            <div className="section-divider" />
          </div>

          <div className={styles.featuresGrid}>
            {[
              { title: 'City-Specific Pricing', desc: <><span className={styles.textHighlight}>Udaipur costs</span> differ from Mumbai. Our agents price by destination.</> },
              { title: 'Human-in-the-Loop', desc: <><span className={styles.textHighlight}>Approve or override</span> AI estimates at every step of the process.</> },
              { title: 'Mobile Responsive', desc: <>Plan your wedding from <span className={styles.textHighlight}>anywhere, on any device.</span></> },
              { title: 'Scenario Comparison', desc: <><span className={styles.textHighlight}>5-star vs resort</span>, 500 guests vs 300 — compare instantly.</> },
              { title: 'PDF Report Export', desc: <>Download professional, <span className={styles.textHighlight}>branded budget reports</span>.</> },
            ].map((f, i) => (
              <div key={i} className={styles.featureCardCenters}>
                <FeatureIcon index={i} />
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
            <div className={styles.ctaImageWrap}>
              <img
                src="/budgetmeetsshaadiicon.png"
                alt="Budget Meets Shaadi"
                className={styles.ctaBrandImage}
                loading="lazy"
              />
            </div>
            <div className={styles.ctaContent}>
              <span className="text-accent">{d.readyToBegin}</span>
              <h2 className="heading-section" style={{ marginTop: 4 }}>
                {d.heroTitle}
              </h2>
              <p className={styles.ctaDesc}>
                Join thousands of couples and wedding planners who trust AI for their most special day.
              </p>
              <Link href="/wizard" className="btn-primary">
                {d.startFree}
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
            <p className={styles.footerCopy}>&copy; 2025 WeddingBudget.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <BottomNav />
    </main>
  );
}
