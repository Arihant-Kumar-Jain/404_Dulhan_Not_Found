'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import styles from './login.module.css';

/* ── Decorative corner ornament SVG ── */
const CornerOrnament = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4C4 4 20 4 30 14C40 24 40 40 40 40" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M4 4C4 4 4 20 14 30C24 40 40 40 40 40" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="4" cy="4" r="3" fill="currentColor" opacity="0.6" />
    <circle cx="40" cy="40" r="2" fill="currentColor" opacity="0.4" />
    <path d="M10 4C10 4 18 8 22 16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    <path d="M4 10C4 10 8 18 16 22" stroke="currentColor" strokeWidth="1" opacity="0.5" />
  </svg>
);

/* ── Mandala ornament SVG ── */
const MandalaOrnament = () => (
  <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.ornamentIcon}>
    <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="1" />
    <circle cx="14" cy="14" r="8" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    <path d="M14 2V6M14 22V26M2 14H6M22 14H26" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
    <circle cx="14" cy="14" r="2" fill="currentColor" opacity="0.5" />
  </svg>
);

/* ── Google logo SVG ── */
const GoogleIcon = () => (
  <svg className={styles.googleIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

/* ── SVG Icons ── */
const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useAuthStore();
  const [entering, setEntering] = useState(false);

  const handleAdmin = () => {
    setEntering(true);
    setRole('admin');
    setTimeout(() => router.push('/'), 400);
  };

  const handleGuest = () => {
    setEntering(true);
    setRole('guest');
    setTimeout(() => router.push('/'), 400);
  };

  const handleGoogle = async () => {
    if (!auth) {
      alert('Firebase configuration is missing. Please set environment variables.');
      return;
    }
    try {
      setEntering(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      alert(`Sign in failed: ${error.message}`);
      setEntering(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      {/* Left side: Photo with text - on laptop left, on mobile top */}
      <div className={styles.photoSection}>
        <div className={styles.photoContainer}>
          <img
            src="/wed_plan.jpeg"
            alt="Wedding Planner"
            className={styles.heroImage}
          />
          <div className={styles.photoCaption}>
            <h2>Plan the wedding<br />of your dreams</h2>
            <p>India's first AI-powered wedding budget estimator with six intelligent agents.</p>
          </div>
        </div>
      </div>

      {/* Right side: Form - on laptop right, on mobile below photo */}
      <div className={styles.formSection}>
        <div className={styles.formContainer} style={entering ? { opacity: 0, transform: 'scale(0.97)', transition: 'all 0.4s ease' } : undefined}>
          {/* Decorative corners - visible only on larger screens */}
          <div className={styles.cornerTL}><CornerOrnament /></div>
          <div className={styles.cornerBR}><CornerOrnament /></div>

          {/* Logo */}
          <h1 className={styles.logo}>
            WeddingBudget<span>.ai</span>
          </h1>
          <p className={styles.tagline}>AI-Powered Wedding Planning</p>

          {/* Ornamental divider */}
          <div className={styles.ornamentDivider}>
            <div className={styles.ornamentLine} />
            <MandalaOrnament />
            <div className={styles.ornamentLine} />
          </div>

          {/* Action Buttons */}
          <div className={styles.btnGroup}>
            <button className={styles.btnAdmin} onClick={handleAdmin}>
              <ShieldIcon />
              Preview as Admin
            </button>

            <button className={styles.btnGuest} onClick={handleGuest}>
              <UserIcon />
              Continue as Guest
            </button>

            <div className={styles.separator}>
              <div className={styles.separatorLine} />
              <span className={styles.separatorText}>or</span>
              <div className={styles.separatorLine} />
            </div>

            <button className={styles.btnGoogle} onClick={handleGoogle}>
              <GoogleIcon />
              Sign in with Google
            </button>
          </div>

          <p className={styles.footerNote}>
            By continuing, you agree to our Terms of Service.<br />
            Firebase Authentication will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}