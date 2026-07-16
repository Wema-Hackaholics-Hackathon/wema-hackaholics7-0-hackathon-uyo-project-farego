"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ShieldCheck, ArrowRight } from "lucide-react";
import "../pay/pay.css";
import "../signup/signup.css"; // Reuse button styles

export default function PassengerPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) > 0) {
      const descParam = description ? `&desc=${encodeURIComponent(description)}` : "";
      router.push(`/${id}/success?amount=${amount}${descParam}`);
    }
  };

  return (
    <div className="pay-container">
      <header className="pay-header">
        <div className="pay-logo">FareGo</div>
        <div className="driver-info">
          <div className="driver-avatar">JD</div>
          <h2 className="driver-name">Paying John Doe</h2>
          <div className="driver-plate">ID: {id?.toUpperCase() || "LAG 123 XY"}</div>
        </div>
      </header>

      <div className="pay-card">
        <div className="pay-label">Enter Fare Amount</div>
        
        <form onSubmit={handlePay}>
          <div className="amount-input-wrapper">
            <span className="amount-currency">₦</span>
            <input 
              type="number" 
              className="amount-input" 
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              autoFocus
              required
            />
          </div>

          <div className="form-group" style={{ textAlign: 'left', marginBottom: '24px' }}>
            <label className="form-label" style={{ fontSize: '12px' }}>Description (Optional)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Passenger Fare, Baggage Fee"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ fontSize: '14px', padding: '12px' }}
            />
          </div>

          <div className="alat-badge">
            <ShieldCheck size={16} /> Secured by ALAT
          </div>

          <button type="submit" className="btn-submit" disabled={!amount}>
            Pay Now <ArrowRight size={20} />
          </button>
        </form>
      </div>
      
      <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '13px', marginTop: '32px', padding: '0 24px' }}>
        No app download required. Choose your payment method securely on the next step.
      </p>
    </div>
  );
}
