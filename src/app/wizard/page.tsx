'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWizardStore } from '@/stores/wizardStore';
import { CITIES, HOTEL_TIERS, EVENTS, DECOR_STYLES, FOOD_TYPES, BAR_TYPES, ENTERTAINMENT_TIERS } from '@/data/constants';
import styles from './wizard.module.css';

/* ═══════════════ Step Components ═══════════════ */

function StepCity() {
  const { input, updateInput } = useWizardStore();

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Where&apos;s the Magic Happening?</h2>
        <p className={styles.stepSubtitle}>Select your wedding destination city</p>
      </div>
      <div className={styles.cityGrid}>
        {CITIES.map((city) => (
          <button
            key={city.id}
            className={`${styles.cityCard} ${input.city === city.id ? styles.citySelected : ''}`}
            onClick={() => updateInput({ city: city.id })}
          >
            <div className={styles.cityImage} style={{ backgroundImage: `url(${city.image})` }} />
            <div className={styles.cityInfo}>
              <h3>{city.name}</h3>
              <span>{city.state}</span>
              <p>{city.description}</p>
            </div>
            {input.city === city.id && <div className={styles.selectedCheck}>✓</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepHotel() {
  const { input, updateInput } = useWizardStore();

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Choose Your Venue Style</h2>
        <p className={styles.stepSubtitle}>This affects your base accommodation costs</p>
      </div>
      <div className={styles.hotelGrid}>
        {HOTEL_TIERS.map((tier) => (
          <button
            key={tier.id}
            className={`${styles.hotelCard} ${input.hotel_tier === tier.id ? styles.hotelSelected : ''}`}
            onClick={() => updateInput({ hotel_tier: tier.id })}
          >
            <div className={styles.hotelIcon}>{tier.icon}</div>
            <h3>{tier.name}</h3>
            <p>{tier.description}</p>
            <span className={styles.priceIndicator}>{tier.priceIndicator}</span>
            {input.hotel_tier === tier.id && <div className={styles.selectedCheck}>✓</div>}
          </button>
        ))}
      </div>
      <div className={styles.sliderSection}>
        <label className={styles.sliderLabel}>
          <span>Number of Rooms</span>
          <strong>{input.room_count}</strong>
        </label>
        <input
          type="range" min="10" max="200" value={input.room_count}
          onChange={(e) => updateInput({ room_count: parseInt(e.target.value) })}
          className={styles.slider}
        />
        <div className={styles.sliderMarks}>
          <span>10</span><span>50</span><span>100</span><span>150</span><span>200</span>
        </div>
      </div>
    </div>
  );
}

function StepGuests() {
  const { input, updateInput } = useWizardStore();

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>How Grand is the Celebration?</h2>
        <p className={styles.stepSubtitle}>Guest count directly impacts F&B, décor, and logistics costs</p>
      </div>
      <div className={styles.guestCenter}>
        <div className={styles.guestCountDisplay}>
          <span className={styles.guestNumber}>{input.guest_count}</span>
          <span className={styles.guestLabel}>Guests</span>
        </div>
        <input
          type="range" min="50" max="2000" step="10" value={input.guest_count}
          onChange={(e) => updateInput({ guest_count: parseInt(e.target.value) })}
          className={styles.slider}
          style={{ maxWidth: '500px', width: '100%' }}
        />
        <div className={styles.sliderMarks} style={{ maxWidth: '500px', width: '100%' }}>
          <span>50</span><span>500</span><span>1000</span><span>1500</span><span>2000</span>
        </div>

        <div className={styles.guestExtras}>
          <div className={styles.sliderSection}>
            <label className={styles.sliderLabel}>
              <span>Outstation Guests</span>
              <strong>{Math.round(input.outstation_percentage * 100)}%</strong>
            </label>
            <input
              type="range" min="0" max="100" value={Math.round(input.outstation_percentage * 100)}
              onChange={(e) => updateInput({ outstation_percentage: parseInt(e.target.value) / 100 })}
              className={styles.slider}
            />
          </div>
        </div>

        <div className={styles.cityInputs}>
          <div className={styles.inputGroup}>
            <label>Bride&apos;s Hometown</label>
            <input
              type="text" value={input.bride_city} placeholder="e.g., Jaipur"
              onChange={(e) => updateInput({ bride_city: e.target.value })}
              className={styles.textInput}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Groom&apos;s Hometown</label>
            <input
              type="text" value={input.groom_city} placeholder="e.g., Delhi"
              onChange={(e) => updateInput({ groom_city: e.target.value })}
              className={styles.textInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepEvents() {
  const { input, toggleEvent } = useWizardStore();

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Select Your Wedding Events</h2>
        <p className={styles.stepSubtitle}>Each event has separate décor, catering, and logistics costs</p>
      </div>
      <div className={styles.eventGrid}>
        {EVENTS.map((event) => {
          const isSelected = input.events.includes(event.id);
          return (
            <button
              key={event.id}
              className={`${styles.eventCard} ${isSelected ? styles.eventSelected : ''}`}
              onClick={() => toggleEvent(event.id)}
              style={{ '--event-color': event.color } as React.CSSProperties}
            >
              <div className={styles.eventIcon}>{event.icon}</div>
              <h3>{event.name}</h3>
              <p>{event.description}</p>
              {isSelected && <div className={styles.eventCheck}>✓</div>}
            </button>
          );
        })}
      </div>
      <p className={styles.eventCount}>
        {input.events.length} event{input.events.length !== 1 ? 's' : ''} selected
      </p>
    </div>
  );
}

function StepDecor() {
  const { input, updateInput } = useWizardStore();

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>What&apos;s Your Décor Vision?</h2>
        <p className={styles.stepSubtitle}>Style and complexity tier directly impact décor costs</p>
      </div>
      <div className={styles.decorGrid}>
        {DECOR_STYLES.map((style) => (
          <button
            key={style.id}
            className={`${styles.decorCard} ${input.decor_style === style.id ? styles.decorSelected : ''}`}
            onClick={() => updateInput({ decor_style: style.id })}
          >
            <div className={styles.decorImage} style={{ backgroundImage: `url(${style.image})` }} />
            <div className={styles.decorInfo}>
              <h3>{style.name}</h3>
              <p>{style.description}</p>
            </div>
            {input.decor_style === style.id && <div className={styles.selectedCheck}>✓</div>}
          </button>
        ))}
      </div>
      <div className={styles.sliderSection} style={{ maxWidth: '500px', margin: '32px auto 0' }}>
        <label className={styles.sliderLabel}>
          <span>Complexity Level</span>
          <strong>{input.decor_complexity}/5</strong>
        </label>
        <input
          type="range" min="1" max="5"
          value={input.decor_complexity}
          onChange={(e) => updateInput({ decor_complexity: parseInt(e.target.value) })}
          className={styles.slider}
        />
        <div className={styles.sliderMarks}>
          <span>Simple</span><span>Moderate</span><span>Grand</span><span>Opulent</span><span>Royal</span>
        </div>
      </div>
    </div>
  );
}

function StepFoodEntertainment() {
  const { input, updateInput } = useWizardStore();

  return (
    <div className={styles.stepContent}>
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Food, Bar & Entertainment</h2>
        <p className={styles.stepSubtitle}>The heart of every Indian celebration</p>
      </div>

      <div className={styles.foodSection}>
        <h3 className={styles.subHeading}>Menu Type</h3>
        <div className={styles.optionRow}>
          {FOOD_TYPES.map((food) => (
            <button
              key={food.id}
              className={`${styles.optionCard} ${input.food_type === food.id ? styles.optionSelected : ''}`}
              onClick={() => updateInput({ food_type: food.id })}
            >
              <span className={styles.optionIcon}>{food.icon}</span>
              <strong>{food.name}</strong>
              <small>{food.description}</small>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.foodSection}>
        <h3 className={styles.subHeading}>Bar Setup</h3>
        <div className={styles.optionRow}>
          {BAR_TYPES.map((bar) => (
            <button
              key={bar.id}
              className={`${styles.optionCard} ${input.bar_type === bar.id ? styles.optionSelected : ''}`}
              onClick={() => updateInput({ bar_type: bar.id })}
            >
              <span className={styles.optionIcon}>{bar.icon}</span>
              <strong>{bar.name}</strong>
              <small>{bar.description}</small>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.foodSection}>
        <h3 className={styles.subHeading}>Entertainment Tier</h3>
        <div className={styles.optionRow}>
          {ENTERTAINMENT_TIERS.map((tier) => (
            <button
              key={tier.id}
              className={`${styles.optionCard} ${input.entertainment_tier === tier.id ? styles.optionSelected : ''}`}
              onClick={() => updateInput({ entertainment_tier: tier.id })}
            >
              <span className={styles.optionIcon}>{tier.icon}</span>
              <strong>{tier.name}</strong>
              <span className={styles.priceTag}>{tier.price}</span>
              <small>{tier.description}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ Progress Bar ═══════════════ */
function WizardProgress({ current, total }: { current: number; total: number }) {
  const steps = ['City', 'Venue', 'Guests', 'Events', 'Décor', 'F&B'];
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>
      <div className={styles.progressSteps}>
        {steps.map((step, i) => (
          <div key={i} className={`${styles.progressStep} ${i <= current ? styles.progressActive : ''}`}>
            <div className={styles.progressDot}>{i < current ? '✓' : i + 1}</div>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════ Main Wizard Page ═══════════════ */
export default function WizardPage() {
  const { currentStep, totalSteps, input, nextStep, prevStep, setComplete } = useWizardStore();
  const router = useRouter();

  const steps = [StepCity, StepHotel, StepGuests, StepEvents, StepDecor, StepFoodEntertainment];
  const CurrentStep = steps[currentStep];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return !!input.city;
      case 1: return !!input.hotel_tier && input.room_count > 0;
      case 2: return input.guest_count > 0;
      case 3: return input.events.length > 0;
      case 4: return !!input.decor_style;
      case 5: return !!input.food_type;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep === totalSteps - 1) {
      setComplete(true);
      router.push('/budget');
    } else {
      nextStep();
    }
  };

  return (
    <div className={styles.wizardPage}>
      <nav className={styles.wizardNav}>
        <Link href="/" className={styles.backLink}>← Back to Home</Link>
        <h1 className={styles.wizardLogo}>WeddingBudget.ai</h1>
      </nav>

      <WizardProgress current={currentStep} total={totalSteps} />

      <div className={styles.wizardBody}>
        <CurrentStep />
      </div>

      <div className={styles.wizardFooter}>
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="btn-secondary"
          style={{ opacity: currentStep === 0 ? 0.3 : 1 }}
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="btn-primary"
        >
          {currentStep === totalSteps - 1 ? 'Generate Budget' : 'Next Step →'}
        </button>
      </div>
    </div>
  );
}
