'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Palmtree, MapPin, Users, CalendarHeart, 
  Wine, Utensils, Music, Sparkles, Gem, Paintbrush 
} from 'lucide-react';
import styles from './page.module.css';

// TypeScript interfaces for our form
export interface WeddingParams {
  city: string;
  guest_count: number;
  events: string[];
  hotel_tier: string;
  food_type: string;
  bar_type: string;
  entertainment_tier: string;
  decor_style: string;
  decor_complexity: number;
  room_count: number;
  outstation_percentage: number;
  special_elements: string[];
}

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<WeddingParams>({
    city: 'udaipur',
    guest_count: 300,
    events: ['sangeet', 'reception'],
    hotel_tier: '5star_palace',
    food_type: 'veg',
    bar_type: 'soft_bev',
    entertainment_tier: 'standard',
    decor_style: 'standard',
    decor_complexity: 2,
    room_count: 50,
    outstation_percentage: 0.3,
    special_elements: []
  });

  const handleNext = () => setStep(s => Math.min(3, s + 1));
  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const updateField = (field: keyof WeddingParams, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'events' | 'special_elements', item: string) => {
    setFormData(prev => {
      const arr = prev[field];
      if (arr.includes(item)) return { ...prev, [field]: arr.filter(i => i !== item) };
      return { ...prev, [field]: [...arr, item] };
    });
  };

  const handleSubmit = () => {
    // Save to local storage for the budget dashboard to read
    localStorage.setItem('weddingParams', JSON.stringify(formData));
    router.push('/budget');
  };

  return (
    <div className={styles.wizardMain}>
      <div className={styles.wizardContainer}>
        
        {/* Progress Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Plan Your Dream Wedding</h1>
          <p className={styles.subtitle}>Let our AI estimate your perfect celebration.</p>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.progressLine} />
          <div className={styles.progressFill} style={{ width: `${((step - 1) / 2) * 100}%` }} />
          {[1, 2, 3].map(i => (
            <div key={i} className={`${styles.stepDot} ${step === i ? styles.active : ''} ${step > i ? styles.completed : ''}`}>
              {i}
            </div>
          ))}
        </div>

        {/* STEP 1: Foundation */}
        {step === 1 && (
          <div className={`${styles.formGrid} animate-fadeIn`}>
            <div className={styles.formGroup}>
              <label className={styles.label}><MapPin size={16} /> Destination City</label>
              <select className={styles.select} value={formData.city} onChange={e => updateField('city', e.target.value)}>
                <option value="udaipur">Udaipur</option>
                <option value="goa">Goa</option>
                <option value="jaipur">Jaipur</option>
                <option value="delhi">Delhi NCR</option>
                <option value="mumbai">Mumbai</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}><Users size={16} /> Guest Count</label>
              <input 
                type="number" 
                className={styles.input} 
                min="50" max="2000" step="50"
                value={formData.guest_count} 
                onChange={e => updateField('guest_count', parseInt(e.target.value) || 300)} 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}><Building2 size={16} /> Outstation Mix (%)</label>
              <select className={styles.select} value={formData.outstation_percentage} onChange={e => updateField('outstation_percentage', parseFloat(e.target.value))}>
                <option value={0.1}>10% (Mostly Locals)</option>
                <option value={0.4}>40% (Mixed)</option>
                <option value={0.8}>80% (Destination Wedding)</option>
                <option value={1.0}>100% (Full Destination)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}><Building2 size={16} /> Rooms Required</label>
              <input 
                type="number" 
                className={styles.input} 
                min="0" max="500" step="10"
                value={formData.room_count} 
                onChange={e => updateField('room_count', parseInt(e.target.value) || 0)} 
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Venue Tier</label>
              <div className={styles.tierGrid}>
                {[
                  { id: 'standard', label: '4-Star Banquets', icon: <Building2 /> },
                  { id: 'premium', label: '5-Star Hotels', icon: <Gem /> },
                  { id: '5star_palace', label: 'Heritage Palaces', icon: <Palmtree /> }
                ].map(t => (
                  <div 
                    key={t.id}
                    className={`${styles.tierCard} ${formData.hotel_tier === t.id ? styles.selected : ''}`}
                    onClick={() => updateField('hotel_tier', t.id)}
                  >
                    <div className={styles.tierIcon}>{t.icon}</div>
                    <div className={styles.tierTitle}>{t.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Events & F&B */}
        {step === 2 && (
          <div className={`${styles.formGrid} animate-fadeIn`}>
            
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}><CalendarHeart size={16}/> Functions</label>
              <div className={styles.selectionChips}>
                {['mehendi', 'haldi', 'sangeet', 'pheras', 'reception'].map(ev => (
                  <div 
                    key={ev} 
                    className={`${styles.chip} ${formData.events.includes(ev) ? styles.selected : ''}`}
                    onClick={() => toggleArrayItem('events', ev)}
                  >
                    {ev.charAt(0).toUpperCase() + ev.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}><Utensils size={16} /> Food Preferences</label>
              <select className={styles.select} value={formData.food_type} onChange={e => updateField('food_type', e.target.value)}>
                <option value="veg">Pure Vegetarian</option>
                <option value="veg_nonveg">Mixed (Veg + Non-Veg)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}><Wine size={16} /> Bar Setup</label>
              <select className={styles.select} value={formData.bar_type} onChange={e => updateField('bar_type', e.target.value)}>
                <option value="none">No Alcohol</option>
                <option value="soft_bev">Mocktails & Soft Bevs</option>
                <option value="beer_wine">Beer & Wine Only</option>
                <option value="full_bar">Premium Full Bar</option>
              </select>
            </div>

             <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}><Music size={16} /> Entertainment Tier</label>
              <div className={styles.tierGrid}>
                {[
                  { id: 'standard', label: 'Local DJs & Light Music' },
                  { id: 'premium', label: 'Live Bands & Anchor' },
                  { id: 'luxury', label: 'Celebrity Acts & Concerts' }
                ].map(t => (
                  <div 
                    key={t.id}
                    className={`${styles.tierCard} ${formData.entertainment_tier === t.id ? styles.selected : ''}`}
                    onClick={() => updateField('entertainment_tier', t.id)}
                  >
                    <div className={styles.tierTitle}>{t.label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* STEP 3: Decor & Extras */}
        {step === 3 && (
          <div className={`${styles.formGrid} animate-fadeIn`}>
            
            <div className={styles.formGroup}>
              <label className={styles.label}><Paintbrush size={16} /> Decor Theme</label>
              <select className={styles.select} value={formData.decor_style} onChange={e => updateField('decor_style', e.target.value)}>
                <option value="traditional">Traditional Indian / Marigold</option>
                <option value="modern">Modern Minimalist</option>
                <option value="boho">Boho Chic / Rustic</option>
                <option value="royal">Royal Rajputana</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}><Sparkles size={16} /> Decor Complexity (1-5)</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="range" 
                  min="1" max="5" 
                  value={formData.decor_complexity} 
                  onChange={e => updateField('decor_complexity', parseInt(e.target.value))}
                  style={{ flexGrow: 1, accentColor: 'var(--maroon)' }}
                />
                <span style={{ fontWeight: 600, color: 'var(--maroon)' }}>{formData.decor_complexity}</span>
              </div>
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}><Gem size={16}/> Premium Add-ons (Optional)</label>
              <div className={styles.selectionChips}>
                {[
                  'Vintage car for Baraat', 
                  'Drone mapping & VR', 
                  'Custom built stage', 
                  'Cold pyros & confetti', 
                  'Foreign hostesses'
                ].map(el => (
                  <div 
                    key={el} 
                    className={`${styles.chip} ${formData.special_elements.includes(el) ? styles.selected : ''}`}
                    onClick={() => toggleArrayItem('special_elements', el)}
                  >
                    {el}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Footer Actions */}
        <div className={styles.footer}>
          {step > 1 ? (
             <button className="btn-secondary" onClick={handleBack}>Go Back</button>
          ) : (
            <div /> // Spacer
          )}
          
          {step < 3 ? (
             <button className="btn-primary" onClick={handleNext}>Next Step</button>
          ) : (
             <button className="btn-gold" onClick={handleSubmit}>Generate Budget</button>
          )}
        </div>

      </div>
    </div>
  );
}
