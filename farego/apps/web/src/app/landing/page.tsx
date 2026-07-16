"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import "./landing.css";

export default function LandingPage() {
  const router = useRouter();

  const handleRegister = () => {
    router.push("/signup");
  };

  return (
    <div className="paygo-web">
      <nav className="nav">
        <div className="nav-brand">
          <img src="/farego_logo_mark.png" alt="FareGo" style={{ height: '32px', objectFit: 'contain' }} />
        </div>
        <div className="nav-links">
          <Link href="#">How it works</Link>
          <Link href="#">For drivers</Link>
          <Link href="#">For riders</Link>
          <Link href="#">Support</Link>
        </div>
        <div className="nav-actions">
          <Link className="nav-login" href="#">
            Log in
          </Link>
          <button className="nav-cta" onClick={handleRegister}>
            Register
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot"></span>Accounts issued with Wema Bank &middot; ALAT
          </div>
          <h1 className="hero-title">
            The fare lands in your account <em>before your passenger steps off.</em>
          </h1>
          <p className="hero-sub">
            FareGo turns every Keke and bus fare into a real bank transaction no
            branch visit, no cash to count at the end of the day. Just scan and go.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleRegister}>
              Register as a driver
            </button>
            <button className="btn-ghost">See how it works</button>
          </div>
          <div className="trust-row">
            <b>50,000+</b>&nbsp;fares paid digitally &middot; <b>0</b> branch visits
            required
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card">
            <svg
              className="route-layer"
              viewBox="0 0 400 480"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                className="route-path"
                d="M -20 440 C 90 380, 60 280, 160 240 S 300 140, 250 90 S 380 30, 360 -10"
              />
              <circle className="stop-dot" cx="30" cy="420" r="5" />
              <circle className="stop-dot" cx="165" cy="235" r="5" />
              <circle className="stop-dot active" cx="258" cy="88" r="6" />
              <circle className="stop-dot" cx="355" cy="10" r="5" />
            </svg>
            <div className="visual-card-content">
              <div className="visual-mark">
                <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M70 200 V70 a10 10 0 0 1 10 -10 H104 a10 10 0 0 1 10 10 V96 H130 a34 34 0 0 1 0 68 H104 V200 a10 10 0 0 1 -10 10 H80 a10 10 0 0 1 -10 -10 Z"
                    fill="#5B2A86"
                  />
                  <rect x="130" y="112" width="16" height="16" rx="3" fill="#F0B429" />
                  <circle cx="192" cy="196" r="9" fill="#5B2A86" />
                </svg>
              </div>
              <p className="visual-caption">
                Every scan is a route. Every route is a payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-num">Register</div>
          <h3 className="feature-title">Sign up in minutes</h3>
          <p className="feature-body">
            Phone number, OTP, basic details. Your Wema account is created
            automatically no branch visit needed.
          </p>
        </div>
        <div className="feature-card">
          <div className="logo-placeholder">FareGo</div>
          <h3 className="feature-title">Show your QR</h3>
          <p className="feature-body">
            A code for your vehicle. Passengers scan it, or dial USSD if they don&apos;t
            have data.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-num">Get paid</div>
          <h3 className="feature-title">Funds land instantly</h3>
          <p className="feature-body">
            Real-time SMS and app confirmation the moment payment clears no
            waiting, no screenshots.
          </p>
        </div>
      </section>
    </div>
  );
}
