'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './decor.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DECOR_CATEGORIES = ['All', 'Mehndi', 'Haldi', 'Sangeet', 'Pheras', 'Reception'];
const DECOR_STYLES_FILTER = ['All Styles', 'Traditional', 'Royal', 'Modern'];

interface DecorImage {
  id: string;
  url: string;
  thumb: string;
  category: string;
  style: string;
  complexity: number;
  estimatedCost: string;
  photographer: string;
}

// Skeleton heights to mimic masonry variation
const SKELETON_HEIGHTS = [220, 280, 200, 260, 240, 300, 210, 250, 270, 230, 290, 220];

// ─────────────────────────────────────────────────────────────────────────────
// Icon components
// ─────────────────────────────────────────────────────────────────────────────

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={styles.heartSvg}>
      {filled ? (
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      ) : (
        <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" />
      )}
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.searchSvg}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.clearSvg}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Semantic Search Hook
//
// Wire this to your vector/embedding search backend.
//
// Expected contract:
//   POST /api/decor/search
//   Body: { query: string }
//   Response: { ids: string[] }   ← ordered by semantic relevance
//
// The hook debounces input (480ms), shows a loading state, and calls
// setSearchResults(images[]) when done. Pass null to clear search mode.
// ─────────────────────────────────────────────────────────────────────────────
function useSemanticSearch(
  query: string,
  allImages: DecorImage[],
  setSearchResults: (results: DecorImage[] | null) => void,
) {
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setSearchResults(null); // null = back to chip-filter mode
      setSearching(false);
      return;
    }

    setSearching(true);

    timerRef.current = setTimeout(async () => {
      try {
        // Search via API using tags stored in Supabase
        const params = new URLSearchParams({ search: query, limit: '120' });
        const res = await fetch(`/api/decor?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.images);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 480);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { searching };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function DecorLibrary() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStyle, setActiveStyle] = useState('All Styles');
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<DecorImage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DecorImage[] | null>(null);
  const [allImages, setAllImages] = useState<DecorImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch images from Supabase via API
  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (activeCategory !== 'All') params.set('category', activeCategory);
        if (activeStyle !== 'All Styles') params.set('style', activeStyle);
        params.set('limit', '120');

        const res = await fetch(`/api/decor?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setAllImages(data.images);
        } else {
          console.error('Failed to fetch decor images');
          setAllImages([]);
        }
      } catch (err) {
        console.error('Error fetching images:', err);
        setAllImages([]);
      } finally {
        setLoading(false);
      }
    }
    fetchImages();
  }, [activeCategory, activeStyle]);

  const { searching } = useSemanticSearch(searchQuery, allImages, setSearchResults);

  const isSearchMode = searchQuery.trim().length > 0;

  const displayed = isSearchMode
    ? (searchResults ?? [])
    : allImages;

  const toggleShortlist = (id: string) => {
    setShortlisted(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  return (
    <div className={styles.decorPage}>
      {/* ── NAV ── */}
      <nav className={styles.decorNav}>
        <Link href="/" className={styles.backLink}>
          <span className={styles.backLine} />
          Home
        </Link>
        <h1 className={styles.decorLogo}>Decor Intelligence Library</h1>
        <span className={styles.shortlistBadge}>{shortlisted.length} Shortlisted</span>
      </nav>

      {/* ── HEADER + SEARCH + FILTERS ── */}
      <div className={styles.decorHeader}>
        <div className={styles.decorHeaderInner}>
          <h2 className={styles.decorHeaderTitle}>Decor Image Library</h2>
          <p className={styles.decorHeaderSub}>Browse by function type, style, and complexity</p>

          {/* Search bar */}
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}><SearchIcon /></span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder='Try "floral mandap", "outdoor sangeet", "minimal haldi"…'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              spellCheck={false}
            />
            <div className={styles.searchRight}>
              {searching && <span className={styles.searchSpinner} />}
              {searchQuery && !searching && (
                <button className={styles.searchClear} onClick={clearSearch} title="Clear search">
                  <ClearIcon />
                </button>
              )}
            </div>
          </div>
          <div className={`${styles.searchHint}${isSearchMode && !searching ? ` ${styles.searchHintVisible}` : ''}`}>
            Semantic search — results ranked by visual &amp; contextual similarity
          </div>

          {/* Chip filters — dimmed in search mode */}
          <div className={`${styles.filters}${isSearchMode ? ` ${styles.filtersDimmed}` : ''}`}>
            <div className={styles.filterRow}>
              {DECOR_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterActive : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className={styles.filterRow}>
              {DECOR_STYLES_FILTER.map(style => (
                <button
                  key={style}
                  className={`${styles.filterBtnSecondary} ${activeStyle === style ? styles.filterActive : ''}`}
                  onClick={() => setActiveStyle(style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── GRID BODY ── */}
      <div className={styles.decorBody}>
        {/* Results meta row */}
        {(isSearchMode || displayed.length !== allImages.length) && (
          <div className={styles.resultsBar}>
            <span className={styles.resultsCount}>
              {searching || loading ? 'Loading…' : `${displayed.length} result${displayed.length !== 1 ? 's' : ''}`}
            </span>
            {isSearchMode && !searching && (
              <span className={styles.resultsQuery}>"{searchQuery}"</span>
            )}
          </div>
        )}

        <div className={styles.masonryGrid}>
          {/* Skeleton shimmer while loading */}
          {(searching || loading) && SKELETON_HEIGHTS.map((h, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImg} style={{ height: h }} />
              <div className={styles.skeletonFoot}>
                <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
                <div className={styles.skeletonLine} style={{ width: '30%' }} />
              </div>
            </div>
          ))}

          {/* Actual results */}
          {!searching && !loading && displayed.map((img, i) => (
            <div
              key={img.id}
              className={`${styles.decorItem} ${shortlisted.includes(img.id) ? styles.decorShortlisted : ''}`}
            >
              <div className={styles.decorImageWrap} onClick={() => setSelectedImage(img)}>
                <img src={img.thumb} alt={`${img.category} ${img.style} décor`} />
                <span className={styles.decorCatTag}>{img.category}</span>
              </div>
              <div className={styles.decorMeta}>
                <div>
                  <div className={styles.decorStyle}>{img.style}</div>
                  <div className={styles.decorDots}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className={`${styles.decorDot} ${n <= img.complexity ? styles.decorDotOn : ''}`} />
                    ))}
                  </div>
                </div>
                <button
                  className={`${styles.heartBtn} ${shortlisted.includes(img.id) ? styles.heartActive : ''}`}
                  onClick={() => toggleShortlist(img.id)}
                >
                  <HeartIcon filled={shortlisted.includes(img.id)} />
                </button>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {!searching && !loading && displayed.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>No results found</div>
              <div className={styles.emptySub}>Try a different search term or clear the query</div>
            </div>
          )}
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {selectedImage && (
        <div className={styles.lightbox} onClick={() => setSelectedImage(null)}>
          <div className={styles.lightboxPanel} onClick={e => e.stopPropagation()}>
            <img
              className={styles.lightboxImg}
              src={selectedImage.url}
              alt={`${selectedImage.category} décor`}
            />
            <div className={styles.lightboxBody}>
              <div>
                <div className={styles.lightboxEyebrow}>
                  {selectedImage.category} · {selectedImage.style}
                </div>
                <div className={styles.lightboxName}>
                  {selectedImage.style}<br /><em>Decor</em>
                </div>
                <div className={styles.lightboxSub}>Wedding function · AI Estimated Cost</div>
              </div>
              <div className={styles.lightboxHr} />
              <div className={styles.lightboxFields}>
                <div>
                  <div className={styles.lightboxFieldLabel}>
                    Complexity — {selectedImage.complexity} / 5
                  </div>
                  <div className={styles.lightboxCBar}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <div
                        key={n}
                        className={`${styles.lightboxCSeg} ${n <= selectedImage.complexity ? styles.lightboxCSegOn : ''}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button
                className={`${styles.lightboxCta} ${shortlisted.includes(selectedImage.id) ? styles.lightboxCtaRemove : ''}`}
                onClick={() => { toggleShortlist(selectedImage.id); setSelectedImage(null); }}
              >
                {shortlisted.includes(selectedImage.id) ? 'Remove from Shortlist' : 'Save to Shortlist'}
              </button>
            </div>
            <button className={styles.lightboxClose} onClick={() => setSelectedImage(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}