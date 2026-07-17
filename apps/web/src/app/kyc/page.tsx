"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldAlert, Briefcase } from "lucide-react";
import "./kyc.css";
import "../signup/signup.css"; // Reuse form inputs
import { isAddress, isIdentityNumber, isOrganizationName, isPlateNumber } from "../../lib/validation";

export default function KYCPage() {
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [bvn, setBvn] = useState("");
  const [address, setAddress] = useState("");
  const [plate, setPlate] = useState("");
  const [union, setUnion] = useState("");
  const [error, setError] = useState("");

  const handleVerifyLevel2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIdentityNumber(bvn)) {
      setError("Enter a valid 11-digit BVN or NIN.");
      return;
    }
    if (!isPlateNumber(plate)) {
      setError("Enter a valid Nigerian plate number, for example LAG-123-XY.");
      return;
    }
    if (!isAddress(address)) {
      setError("Enter a complete address between 10 and 160 characters.");
      return;
    }
    setError("");
    setLevel(2);
  };

  const handleVerifyLevel3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOrganizationName(union)) {
      setError("Enter a valid union or association name.");
      return;
    }
    setError("");
    setLevel(3);
  };

  return (
    <div className="kyc-container">
      <header className="kyc-header">
        <Link href="/dashboard" className="kyc-back">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="kyc-title">Account Limits & KYC</h1>
      </header>

      {/* Level 1: Basic */}
      <div className="tier-card completed">
        <div className="tier-header">
          <div>
            <h2 className="tier-name">
              <CheckCircle2 size={20} color="#2ECC71" /> Basic Level
            </h2>
            <p className="tier-desc">Phone, OTP & Identity verified.</p>
          </div>
          <span className="tier-status status-completed">Verified</span>
        </div>
        <ul className="tier-benefits">
          <li><CheckCircle2 size={16} /> Instant Wema/ALAT Account</li>
          <li><CheckCircle2 size={16} /> Receive Fares via QR & USSD</li>
          <li><CheckCircle2 size={16} /> ₦50,000 Daily Transaction Limit</li>
        </ul>
      </div>

      {/* Level 2: Verified */}
      <div className={`tier-card ${level >= 2 ? 'completed' : level === 1 ? 'active' : ''}`}>
        <div className="tier-header">
          <div>
            <h2 className="tier-name">
              {level >= 2 ? <CheckCircle2 size={20} color="#2ECC71" /> : <ShieldAlert size={20} color="var(--purple)" />}
              Verified Level
            </h2>
            <p className="tier-desc">Link your BVN/NIN and Address.</p>
          </div>
          <span className={`tier-status ${level >= 2 ? 'status-completed' : level === 1 ? 'status-pending' : 'status-locked'}`}>
            {level >= 2 ? 'Verified' : level === 1 ? 'Action Required' : 'Locked'}
          </span>
        </div>
        
        <ul className="tier-benefits">
          <li><CheckCircle2 size={16} /> Name matching & security</li>
          <li><CheckCircle2 size={16} /> ₦200,000 Daily Transaction Limit</li>
        </ul>

        {level === 1 && (
          <form className="tier-form" onSubmit={handleVerifyLevel2}>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-group">
              <label className="form-label">BVN or NIN</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter 11-digit number" 
                value={bvn}
                onChange={(e) => { setBvn(e.target.value.replace(/\D/g, "")); setError(""); }}
                inputMode="numeric"
                minLength={11}
                maxLength={11}
                pattern="[0-9]{11}"
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Plate Number</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. LAG-123-XY" 
                value={plate}
                onChange={(e) => { setPlate(e.target.value.toUpperCase()); setError(""); }}
                minLength={7}
                maxLength={12}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Home Address</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="123 Example Street, Lagos" 
                value={address}
                onChange={(e) => { setAddress(e.target.value); setError(""); }}
                minLength={10}
                maxLength={160}
                autoComplete="street-address"
                required 
              />
            </div>
            <button type="submit" className="btn-upgrade">Verify Identity</button>
          </form>
        )}
      </div>

      {/* Level 3: Business */}
      <div className={`tier-card ${level === 3 ? 'completed' : level === 2 ? 'active' : ''}`}>
        <div className="tier-header">
          <div>
            <h2 className="tier-name">
              {level === 3 ? <CheckCircle2 size={20} color="#2ECC71" /> : <Briefcase size={20} color="var(--ink)" />}
              Business Level
            </h2>
            <p className="tier-desc">Transport Union & Business Verification.</p>
          </div>
          <span className={`tier-status ${level === 3 ? 'status-completed' : level === 2 ? 'status-pending' : 'status-locked'}`}>
            {level === 3 ? 'Verified' : level === 2 ? 'Upgrade Available' : 'Locked'}
          </span>
        </div>
        
        <ul className="tier-benefits">
          <li><CheckCircle2 size={16} /> Unlimited Daily Transactions</li>
          <li><CheckCircle2 size={16} /> Access to vehicle financing & loans</li>
        </ul>

        {level === 2 && (
          <form className="tier-form" onSubmit={handleVerifyLevel3}>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-group">
              <label className="form-label">Union / Association Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. NURTW Local Branch" 
                value={union}
                onChange={(e) => { setUnion(e.target.value); setError(""); }}
                minLength={3}
                maxLength={100}
                required 
              />
            </div>
            <button type="submit" className="btn-upgrade">Submit for Review</button>
          </form>
        )}
      </div>

    </div>
  );
}
