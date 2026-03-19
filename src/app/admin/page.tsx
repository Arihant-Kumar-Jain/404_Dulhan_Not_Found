'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

type Tab = 'costs' | 'decor' | 'artists' | 'overview';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  if (!isAuthenticated) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>🔒 Admin Access</h2>
          <p className={styles.loginDesc}>Enter admin password to access the control panel</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            className={styles.loginInput}
            onKeyDown={e => e.key === 'Enter' && setIsAuthenticated(true)}
          />
          <button className="btn-primary" onClick={() => setIsAuthenticated(true)}>
            Access Admin Panel
          </button>
          <p className={styles.loginHint}>Hint: Any password works in demo mode</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      <nav className={styles.adminNav}>
        <Link href="/" className={styles.backLink}>← Home</Link>
        <h1 className={styles.adminLogo}>⚙️ Admin Panel</h1>
        <button className={styles.logoutBtn} onClick={() => setIsAuthenticated(false)}>Logout</button>
      </nav>

      <div className={styles.adminBody}>
        <div className={styles.sidebar}>
          {[
            { id: 'overview' as Tab, icon: '📊', label: 'Overview' },
            { id: 'costs' as Tab, icon: '💰', label: 'Cost Database' },
            { id: 'decor' as Tab, icon: '🎨', label: 'Décor Labels' },
            { id: 'artists' as Tab, icon: '🎤', label: 'Artist Database' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`${styles.sidebarBtn} ${activeTab === tab.id ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {activeTab === 'overview' && (
            <div className={styles.overviewGrid}>
              <div className={styles.overviewCard}>
                <h3>💰 Cost Database</h3>
                <p className={styles.overviewNum}>6</p>
                <span>City pricing sets</span>
              </div>
              <div className={styles.overviewCard}>
                <h3>🎨 Décor Images</h3>
                <p className={styles.overviewNum}>12</p>
                <span>Labeled references</span>
              </div>
              <div className={styles.overviewCard}>
                <h3>🎤 Artists</h3>
                <p className={styles.overviewNum}>9</p>
                <span>In database</span>
              </div>
              <div className={styles.overviewCard}>
                <h3>📈 Estimates</h3>
                <p className={styles.overviewNum}>0</p>
                <span>Generated today</span>
              </div>
            </div>
          )}

          {activeTab === 'costs' && (
            <div>
              <h2 className={styles.contentTitle}>City-wise Cost Database</h2>
              <p className={styles.contentDesc}>Edit venue rates per night by city and hotel tier</p>
              <div className={styles.costTable}>
                <table>
                  <thead>
                    <tr>
                      <th>City</th>
                      <th>Hotel Tier</th>
                      <th>Low (₹/night)</th>
                      <th>Mid (₹/night)</th>
                      <th>High (₹/night)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Udaipur', '5-Star Palace', '30,000', '45,000', '65,000'],
                      ['Udaipur', '5-Star City', '15,000', '25,000', '40,000'],
                      ['Jaipur', '5-Star Palace', '25,000', '40,000', '55,000'],
                      ['Mumbai', '5-Star Palace', '35,000', '50,000', '75,000'],
                      ['Delhi', '5-Star Palace', '28,000', '42,000', '60,000'],
                      ['Goa', '5-Star Palace', '20,000', '35,000', '50,000'],
                    ].map(([city, tier, low, mid, high], i) => (
                      <tr key={i}>
                        <td>{city}</td>
                        <td>{tier}</td>
                        <td>₹{low}</td>
                        <td>₹{mid}</td>
                        <td>₹{high}</td>
                        <td><button className={styles.editBtn}>Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'decor' && (
            <div>
              <h2 className={styles.contentTitle}>Décor Image Labelling</h2>
              <p className={styles.contentDesc}>Label décor images with function type, style, complexity, and seed cost</p>
              <div className={styles.labelGrid}>
                {[1,2,3,4].map(i => (
                  <div key={i} className={styles.labelCard}>
                    <div className={styles.labelImage} style={{ backgroundImage: `url(https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=300)` }} />
                    <div className={styles.labelForm}>
                      <select className={styles.labelSelect}>
                        <option>Function: Pheras</option>
                        <option>Function: Reception</option>
                        <option>Function: Sangeet</option>
                      </select>
                      <select className={styles.labelSelect}>
                        <option>Style: Traditional</option>
                        <option>Style: Royal</option>
                        <option>Style: Modern</option>
                      </select>
                      <select className={styles.labelSelect}>
                        <option>Complexity: 3/5</option>
                        <option>Complexity: 4/5</option>
                        <option>Complexity: 5/5</option>
                      </select>
                      <input className={styles.labelInput} placeholder="Seed cost (₹)" defaultValue="15,00,000" />
                      <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '6px 14px' }}>Save Label</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'artists' && (
            <div>
              <h2 className={styles.contentTitle}>Artist & Entertainment Database</h2>
              <p className={styles.contentDesc}>Manage artist types and fee ranges</p>
              <div className={styles.costTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Artist Type</th>
                      <th>Low (₹)</th>
                      <th>Mid (₹)</th>
                      <th>High (₹)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Local DJ', '50K', '1L', '1.5L'],
                      ['Professional DJ', '1.5L', '3L', '5L'],
                      ['Bollywood Singer (B-tier)', '5L', '8L', '12L'],
                      ['Bollywood Singer (A-tier)', '8L', '15L', '25L'],
                      ['Live Band', '1L', '2L', '3.5L'],
                      ['Folk Artists', '30K', '60K', '1L'],
                      ['Choreographer', '50K', '1L', '2L'],
                      ['Anchor/Emcee', '40K', '80K', '1.5L'],
                      ['Celebrity Performer', '20L', '50L', '1Cr'],
                    ].map(([type, low, mid, high], i) => (
                      <tr key={i}>
                        <td>{type}</td>
                        <td>₹{low}</td>
                        <td>₹{mid}</td>
                        <td>₹{high}</td>
                        <td><button className={styles.editBtn}>Edit</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
