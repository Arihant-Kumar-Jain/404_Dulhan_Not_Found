'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

type Tab = 'costs' | 'decor' | 'artists' | 'overview';

/* ── Inline SVG Icons ── */
const iconProps = {
  width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.8,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
};

const LockIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...iconProps} width={size} height={size}>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const GearIcon = ({ size = 18 }: { size?: number }) => (
  <svg {...iconProps} width={size} height={size}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const ChartIcon = () => (
  <svg {...iconProps}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);
const CoinsIcon = () => (
  <svg {...iconProps}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const PaletteIcon = () => (
  <svg {...iconProps}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z" />
    <circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" />
    <circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" />
    <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" />
  </svg>
);
const MusicIcon = () => (
  <svg {...iconProps}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);
const TrendingUpIcon = () => (
  <svg {...iconProps}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
const UploadIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4l4 4 4-4" />
  </svg>
);

/* ── Decor data ── */
type DecorItem = {
  img: string;
  fn: string;
  ceremonyTitle: string;
  ceremonySubtitle: string;
  style: string;
  complexity: number; // out of 5
  cost: string;
  sourceId?: string; // Supabase source_id for DB-backed images
};

const DECOR_ITEMS: DecorItem[] = [
  {
    img: '/assets/pheras.jpg',
    fn: 'Pheras',
    ceremonyTitle: 'Sacred Ceremony',
    ceremonySubtitle: 'Wedding Function · Mandap Setup',
    style: 'Royal',
    complexity: 4,
    cost: '18,00,000',
  },
  {
    img: '/assets/sangeet.jpg',
    fn: 'Sangeet',
    ceremonyTitle: 'Dance & Celebration',
    ceremonySubtitle: 'Pre-Wedding Function · Stage Décor',
    style: 'Modern',
    complexity: 3,
    cost: '12,00,000',
  },
  {
    img: '/assets/haldi.jpg',
    fn: 'Haldi',
    ceremonyTitle: 'Golden Ritual',
    ceremonySubtitle: 'Pre-Wedding Function · Floral Setting',
    style: 'Royal',
    complexity: 3,
    cost: '8,00,000',
  },
];

/* ── DB Image type for picker ── */
type DBImage = {
  id: string;
  url: string;
  thumb: string;
  category: string;
  style: string;
  tags: string;
  author: string;
};

/* ── Complexity dots ── */
function ComplexityDots({ count, total = 5 }: { count: number; total?: number }) {
  return (
    <div className={styles.complexityDots}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`${styles.complexityDot} ${i < count ? styles.complexityDotFilled : ''}`}
        />
      ))}
    </div>
  );
}

/* ── Single decor card (now saves to DB) ── */
function DecorCard({ item, onSaved }: { item: DecorItem; onSaved?: (id: string) => void }) {
  const [fn, setFn] = useState(item.fn);
  const [style, setStyle] = useState(item.style);
  const [complexity, setComplexity] = useState(item.complexity);
  const [cost, setCost] = useState(item.cost);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    // If item has a sourceId, save to Supabase
    if (item.sourceId) {
      setSaving(true);
      try {
        const res = await fetch('/api/decor', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source_id: item.sourceId,
            function_type: fn,
            style: style,
            complexity_tier: complexity,
            cost_estimate: cost ? `₹${cost}` : null,
          }),
        });
        if (res.ok) {
          setSaved(true);
          setTimeout(() => {
            setSaved(false);
            onSaved?.(item.sourceId!);
          }, 1500);
        }
      } catch (err) {
        console.error('Save failed:', err);
      } finally {
        setSaving(false);
      }
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className={styles.labelCard}>
      {/* Image panel */}
      <div className={styles.labelImageWrap}>
        <div
          className={styles.labelImage}
          style={{ backgroundImage: `url(${item.img})` }}
        />
        <div className={styles.labelImageOverlay} />
        <span className={styles.labelFnBadge}>{fn}</span>
      </div>

      {/* Form body */}
      <div className={styles.labelForm}>
        {/* Title block */}
        <div className={styles.labelCardTop}>
          <p className={styles.labelCeremonyTitle}>{item.ceremonyTitle}</p>
          <p className={styles.labelCeremonySubtitle}>{item.ceremonySubtitle}</p>
          <ComplexityDots count={complexity} />
        </div>

        {/* Selectors */}
        <div className={styles.labelSelectorsRow}>
          <div className={styles.labelSelectWrap}>
            <label>Function</label>
            <select
              className={styles.labelSelect}
              value={fn}
              onChange={e => setFn(e.target.value)}
            >
              <option>Pheras</option>
              <option>Reception</option>
              <option>Sangeet</option>
              <option>Haldi</option>
              <option>Mehndi</option>
            </select>
            <span className={styles.labelSelectArrow}><ChevronDownIcon /></span>
          </div>

          <div className={styles.labelSelectWrap}>
            <label>Style</label>
            <select
              className={styles.labelSelect}
              value={style}
              onChange={e => setStyle(e.target.value)}
            >
              <option>Traditional</option>
              <option>Royal</option>
              <option>Modern</option>
            </select>
            <span className={styles.labelSelectArrow}><ChevronDownIcon /></span>
          </div>

          <div className={styles.labelSelectWrap}>
            <label>Complexity</label>
            <select
              className={styles.labelSelect}
              value={complexity}
              onChange={e => setComplexity(Number(e.target.value))}
            >
              <option value={1}>1 / 5</option>
              <option value={2}>2 / 5</option>
              <option value={3}>3 / 5</option>
              <option value={4}>4 / 5</option>
              <option value={5}>5 / 5</option>
            </select>
            <span className={styles.labelSelectArrow}><ChevronDownIcon /></span>
          </div>
        </div>

        <div className={styles.labelDivider} />

        {/* Cost + Save */}
        <div className={styles.labelBottomRow}>
          <div className={styles.labelCostWrap}>
            <label>Seed Cost</label>
            <div className={styles.labelCostInputInner}>
              <span className={styles.labelRupeeSym}>₹</span>
              <input
                type="text"
                className={styles.labelInput}
                value={cost}
                onChange={e => setCost(e.target.value)}
                placeholder="e.g. 12,00,000"
              />
            </div>
          </div>
          <button
            className={`${styles.labelSaveBtn} ${saved ? styles.labelSaveBtnSaved : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Label'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Image Picker Modal ── */
function ImagePickerModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (images: DBImage[]) => void;
}) {
  const [images, setImages] = useState<DBImage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 30;

  const fetchImages = useCallback(async (newOffset: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/decor/unlabeled?limit=${PAGE_SIZE}&offset=${newOffset}`);
      if (res.ok) {
        const data = await res.json();
        if (newOffset === 0) {
          setImages(data.images);
        } else {
          setImages(prev => [...prev, ...data.images]);
        }
        setTotal(data.total);
      }
    } catch (err) {
      console.error('Failed to fetch unlabeled images:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages(0);
  }, [fetchImages]);

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    const selectedImages = images.filter(img => selected.has(img.id));
    onSelect(selectedImages);
    onClose();
  }

  function loadMore() {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    fetchImages(newOffset);
  }

  return (
    <div className={styles.pickerOverlay} onClick={onClose}>
      <div className={styles.pickerModal} onClick={e => e.stopPropagation()}>
        <div className={styles.pickerHeader}>
          <div>
            <h3 className={styles.pickerTitle}>Select Images to Label</h3>
            <p className={styles.pickerSubtitle}>{total} unlabeled images in database</p>
          </div>
          <button className={styles.pickerClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.pickerGrid}>
          {images.map(img => (
            <div
              key={img.id}
              className={`${styles.pickerCard} ${selected.has(img.id) ? styles.pickerCardSelected : ''}`}
              onClick={() => toggleSelect(img.id)}
            >
              <img src={img.thumb} alt={img.tags || 'Decor image'} />
              <div className={styles.pickerCardOverlay}>
                <span className={styles.pickerTag}>{img.category}</span>
              </div>
              {selected.has(img.id) && (
                <div className={styles.pickerCheck}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div key={`skel-${i}`} className={styles.pickerSkeleton} />
          ))}
        </div>

        <div className={styles.pickerFooter}>
          {images.length < total && (
            <button className={styles.pickerLoadMore} onClick={loadMore} disabled={loading}>
              {loading ? 'Loading…' : `Load More (${total - images.length} remaining)`}
            </button>
          )}
          <button
            className={styles.pickerAddBtn}
            onClick={handleAdd}
            disabled={selected.size === 0}
          >
            Add Selected ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [dbDecorItems, setDbDecorItems] = useState<DecorItem[]>([]);

  if (!isAuthenticated) {
    return (
      <div className={styles.loginPage}>
        <div className={styles.loginCard}>
          <div className={styles.loginIconWrap}>
            <LockIcon size={24} />
          </div>
          <h2 className={styles.loginTitle}>Admin Access</h2>
          <p className={styles.loginDesc}>Enter your credentials to access the admin control panel</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            className={styles.loginInput}
            onKeyDown={e => e.key === 'Enter' && setIsAuthenticated(true)}
          />
          <button
            className="btn-primary"
            style={{ width: '100%', borderRadius: '10px' }}
            onClick={() => setIsAuthenticated(true)}
          >
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
        <div className={styles.adminLogoWrap}>
          <div className={styles.adminLogoIcon}><GearIcon size={16} /></div>
          <h1 className={styles.adminLogo}>Admin Panel</h1>
        </div>
        <button className={styles.logoutBtn} onClick={() => setIsAuthenticated(false)}>Logout</button>
      </nav>

      <div className={styles.adminBody}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarLabel}>Navigation</div>
          {[
            { id: 'overview' as Tab, icon: <ChartIcon />, label: 'Overview' },
            { id: 'costs' as Tab, icon: <CoinsIcon />, label: 'Cost Database' },
            { id: 'decor' as Tab, icon: <PaletteIcon />, label: 'Décor Labels' },
            { id: 'artists' as Tab, icon: <MusicIcon />, label: 'Artist Database' },
          ].map(tab => (
            <button
              key={tab.id}
              className={`${styles.sidebarBtn} ${activeTab === tab.id ? styles.sidebarActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.icon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.content}>

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <>
              <h2 className={styles.contentTitle}>Dashboard Overview</h2>
              <p className={styles.contentDesc}>Summary of your wedding budget data at a glance</p>
              <div className={styles.overviewGrid}>
                <div className={styles.overviewCard}>
                  <div className={styles.overviewCardHeader}>
                    <div className={styles.overviewCardIcon}><CoinsIcon /></div>
                    <span className={styles.overviewCardLabel}>Costs</span>
                  </div>
                  <p className={styles.overviewNum}>6</p>
                  <span>City pricing sets</span>
                </div>
                <div className={styles.overviewCard}>
                  <div className={styles.overviewCardHeader}>
                    <div className={styles.overviewCardIcon}><PaletteIcon /></div>
                    <span className={styles.overviewCardLabel}>Décor</span>
                  </div>
                  <p className={styles.overviewNum}>12</p>
                  <span>Labeled references</span>
                </div>
                <div className={styles.overviewCard}>
                  <div className={styles.overviewCardHeader}>
                    <div className={styles.overviewCardIcon}><MusicIcon /></div>
                    <span className={styles.overviewCardLabel}>Artists</span>
                  </div>
                  <p className={styles.overviewNum}>9</p>
                  <span>In database</span>
                </div>
                <div className={styles.overviewCard}>
                  <div className={styles.overviewCardHeader}>
                    <div className={styles.overviewCardIcon}><TrendingUpIcon /></div>
                    <span className={styles.overviewCardLabel}>Estimates</span>
                  </div>
                  <p className={styles.overviewNum}>0</p>
                  <span>Generated today</span>
                </div>
              </div>
            </>
          )}

          {/* ── Cost Database ── */}
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

          {/* ── Décor Labels ── */}
          {activeTab === 'decor' && (
            <div>
              <h2 className={styles.contentTitle}>Décor Image Labelling</h2>
              <p className={styles.contentDesc}>Label décor images with function type, style, complexity, and seed cost</p>
              <div className={styles.labelGrid}>
                {DECOR_ITEMS.map((item, i) => (
                  <DecorCard key={`static-${i}`} item={item} />
                ))}

                {dbDecorItems.map((item) => (
                  <DecorCard
                    key={`db-${item.sourceId}`}
                    item={item}
                    onSaved={(id) => {
                      setDbDecorItems(prev => prev.filter(x => x.sourceId !== id));
                    }}
                  />
                ))}

                {/* Upload new — opens picker */}
                <div className={styles.labelUploadZone} onClick={() => setShowPicker(true)}>
                  <span className={styles.labelUploadIcon}><UploadIcon /></span>
                  <span className={styles.labelUploadText}>Select images from database to label</span>
                </div>
              </div>

              {showPicker && (
                <ImagePickerModal
                  onClose={() => setShowPicker(false)}
                  onSelect={(imgs) => {
                    const newItems: DecorItem[] = imgs.map(img => ({
                      img: img.url,
                      fn: img.category || 'Pheras',
                      ceremonyTitle: img.tags?.split(',')[0]?.trim() || 'Unlabeled',
                      ceremonySubtitle: `Source: ${img.author}`,
                      style: img.style || 'Traditional',
                      complexity: 3,
                      cost: '',
                      sourceId: img.id,
                    }));
                    setDbDecorItems(prev => [...prev, ...newItems]);
                  }}
                />
              )}
            </div>
          )}

          {/* ── Artists ── */}
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