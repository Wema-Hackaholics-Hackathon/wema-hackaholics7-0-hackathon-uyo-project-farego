"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ArrowLeft, Building2, UserCircle2 } from "lucide-react";
import "./signup.css";

type Step = "NAME" | "HAS_WEMA" | "WEMA_ACCOUNT" | "PHONE" | "OTP" | "SUCCESS";

export default function SignupPage() {
  const router = useRouter();
  const [history, setHistory] = useState<Step[]>(["NAME"]);
  const step = history[history.length - 1];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wemaAccount, setWemaAccount] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  
  const goForward = (nextStep: Step) => setHistory([...history, nextStep]);
  const goBack = () => setHistory(history.slice(0, -1));

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.length > 2) goForward("HAS_WEMA");
  };

  const handleWemaAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (wemaAccount.length === 10) goForward("SUCCESS");
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length > 9) goForward("OTP");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.every(v => v !== "")) goForward("SUCCESS");
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {history.length > 1 && step !== "SUCCESS" && (
          <button 
            type="button"
            onClick={goBack}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'var(--muted)', 
              marginBottom: '24px', 
              padding: 0 
            }}
          >
            <ArrowLeft size={20} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Back</span>
          </button>
        )}

        {step === "NAME" && (
          <form onSubmit={handleNameSubmit}>
            <div className="signup-header">
              <h1 className="signup-title">Get Started</h1>
              <p className="signup-sub">Tell us your name to create your FareGo account.</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-submit">
              Continue <ArrowRight size={20} />
            </button>
            <button type="button" className="btn-secondary" onClick={() => router.push('/landing')}>
              Already have an account? Log in
            </button>
          </form>
        )}

        {step === "HAS_WEMA" && (
          <div>
            <div className="signup-header">
              <h1 className="signup-title">Bank Details</h1>
              <p className="signup-sub">Do you already have a Wema Bank or ALAT account?</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                type="button"
                className="btn-submit" 
                style={{ background: '#fff', color: 'var(--ink)', border: '1.5px solid var(--border)', boxShadow: 'none' }}
                onClick={() => goForward("WEMA_ACCOUNT")}
              >
                <Building2 size={20} /> Yes, I have an account
              </button>
              
              <button 
                type="button"
                className="btn-submit" 
                onClick={() => goForward("PHONE")}
              >
                <UserCircle2 size={20} /> No, I need an account
              </button>
            </div>
          </div>
        )}

        {step === "WEMA_ACCOUNT" && (
          <form onSubmit={handleWemaAccountSubmit}>
            <div className="signup-header">
              <h1 className="signup-title">Link your account</h1>
              <p className="signup-sub">Enter your 10-digit Wema Bank account number.</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input 
                type="text" 
                inputMode="numeric"
                className="form-input" 
                placeholder="e.g. 0123456789"
                value={wemaAccount}
                onChange={(e) => setWemaAccount(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={10}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-submit">
              Link Account <ArrowRight size={20} />
            </button>
          </form>
        )}

        {step === "PHONE" && (
          <form onSubmit={handlePhoneSubmit}>
            <div className="signup-header">
              <h1 className="signup-title">Create Account</h1>
              <p className="signup-sub">Enter your phone number to automatically create a Wema account.</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="e.g. 0801 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-submit">
              Continue <ArrowRight size={20} />
            </button>
          </form>
        )}

        {step === "OTP" && (
          <form onSubmit={handleOtpSubmit}>
            <div className="signup-header">
              <h1 className="signup-title">Verify Phone</h1>
              <p className="signup-sub">We've sent a 6-digit code to {phone || 'your number'}.</p>
            </div>

            <div className="form-group" style={{ marginBottom: '32px' }}>
              <div className="otp-container">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value.replace(/[^0-9]/g, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && i > 0) {
                        const prev = document.getElementById(`otp-${i - 1}`);
                        prev?.focus();
                      }
                    }}
                    required
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="btn-submit">
              Verify Code
            </button>
          </form>
        )}

        {step === "SUCCESS" && (
          <div style={{ textAlign: 'center', paddingTop: '16px' }}>
            <div className="success-icon">
              <Check size={40} strokeWidth={3} />
            </div>
            <h1 className="signup-title">Account Ready!</h1>
            <p className="signup-sub" style={{ marginBottom: '32px' }}>
              Your Wema Bank account is fully set up and linked to FareGo. You're ready to receive instant digital fares.
            </p>
            <button className="btn-submit" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
