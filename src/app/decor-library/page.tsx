'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './decor.module.css';

const DECOR_CATEGORIES = ['All', 'Mehendi', 'Haldi', 'Sangeet', 'Pheras', 'Reception'];
const DECOR_STYLES_FILTER = ['All Styles', 'Traditional', 'Royal', 'Modern', 'Rustic', 'Glamorous'];

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

// Use Unsplash images for demo
const SAMPLE_IMAGES: DecorImage[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=800', thumb: 'https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?w=400', category: 'Pheras', style: 'Traditional', complexity: 4, estimatedCost: '₹15-25L', photographer: 'Unsplash' },
  { id: '2', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800', thumb: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', category: 'Reception', style: 'Royal', complexity: 5, estimatedCost: '₹30-50L', photographer: 'Unsplash' },
  { id: '3', url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800', thumb: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400', category: 'Sangeet', style: 'Modern', complexity: 3, estimatedCost: '₹8-15L', photographer: 'Unsplash' },
  { id: '4', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800', thumb: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400', category: 'Mehendi', style: 'Rustic', complexity: 2, estimatedCost: '₹3-8L', photographer: 'Unsplash' },
  { id: '5', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', thumb: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400', category: 'Reception', style: 'Glamorous', complexity: 4, estimatedCost: '₹20-35L', photographer: 'Unsplash' },
  { id: '6', url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800', thumb: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=400', category: 'Pheras', style: 'Traditional', complexity: 5, estimatedCost: '₹25-40L', photographer: 'Unsplash' },
  { id: '7', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', thumb: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400', category: 'Sangeet', style: 'Modern', complexity: 3, estimatedCost: '₹10-18L', photographer: 'Unsplash' },
  { id: '8', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800', thumb: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400', category: 'Haldi', style: 'Traditional', complexity: 2, estimatedCost: '₹2-5L', photographer: 'Unsplash' },
  { id: '9', url: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800', thumb: 'https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=400', category: 'Reception', style: 'Royal', complexity: 5, estimatedCost: '₹35-55L', photographer: 'Unsplash' },
  { id: '10', url: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=800', thumb: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400', category: 'Mehendi', style: 'Rustic', complexity: 1, estimatedCost: '₹1-3L', photographer: 'Unsplash' },
  { id: '11', url: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800', thumb: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=400', category: 'Sangeet', style: 'Glamorous', complexity: 4, estimatedCost: '₹18-30L', photographer: 'Unsplash' },
  { id: '12', url: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800', thumb: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=400', category: 'Pheras', style: 'Royal', complexity: 5, estimatedCost: '₹40-60L', photographer: 'Unsplash' },
];

export default function DecorLibrary() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStyle, setActiveStyle] = useState('All Styles');
  const [shortlisted, setShortlisted] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<DecorImage | null>(null);

  const filtered = SAMPLE_IMAGES.filter(img => {
    if (activeCategory !== 'All' && img.category !== activeCategory) return false;
    if (activeStyle !== 'All Styles' && img.style !== activeStyle) return false;
    return true;
  });

  const toggleShortlist = (id: string) => {
    setShortlisted(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.decorPage}>
      <nav className={styles.decorNav}>
        <Link href="/" className={styles.backLink}>← Home</Link>
        <h1 className={styles.decorLogo}>🎨 Décor Intelligence Library</h1>
        <span className={styles.shortlistBadge}>{shortlisted.length} shortlisted</span>
      </nav>

      {/* Filters */}
      <div className={styles.filters}>
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

      {/* Masonry Grid */}
      <div className={styles.masonryGrid}>
        {filtered.map((img, i) => (
          <div
            key={img.id}
            className={`${styles.decorItem} ${shortlisted.includes(img.id) ? styles.decorShortlisted : ''}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={styles.decorImageWrap} onClick={() => setSelectedImage(img)}>
              <img src={img.thumb} alt={`${img.category} ${img.style} décor`} loading="lazy" />
              <div className={styles.decorOverlay}>
                <span className={styles.decorCategory}>{img.category}</span>
                <span className={styles.decorCost}>{img.estimatedCost}</span>
              </div>
            </div>
            <div className={styles.decorMeta}>
              <div>
                <span className={styles.decorStyle}>{img.style}</span>
                <span className={styles.decorLevel}>{'⬥'.repeat(img.complexity)}{'⬦'.repeat(5 - img.complexity)}</span>
              </div>
              <button
                className={`${styles.heartBtn} ${shortlisted.includes(img.id) ? styles.heartActive : ''}`}
                onClick={() => toggleShortlist(img.id)}
              >
                {shortlisted.includes(img.id) ? '❤️' : '🤍'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className={styles.lightbox} onClick={() => setSelectedImage(null)}>
          <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
            <img src={selectedImage.url} alt={`${selectedImage.category} décor`} />
            <div className={styles.lightboxInfo}>
              <h3>{selectedImage.category} — {selectedImage.style}</h3>
              <p>Complexity: {'★'.repeat(selectedImage.complexity)}{'☆'.repeat(5 - selectedImage.complexity)}</p>
              <p className={styles.lightboxCost}>AI Estimated Cost: {selectedImage.estimatedCost}</p>
              <button
                className={`btn-primary`}
                style={{ marginTop: '12px' }}
                onClick={() => { toggleShortlist(selectedImage.id); setSelectedImage(null); }}
              >
                {shortlisted.includes(selectedImage.id) ? '💔 Remove from Shortlist' : '❤️ Add to Shortlist'}
              </button>
            </div>
            <button className={styles.lightboxClose} onClick={() => setSelectedImage(null)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
