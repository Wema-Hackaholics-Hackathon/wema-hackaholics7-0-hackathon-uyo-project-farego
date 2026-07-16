"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Check } from "lucide-react";
import "../../pay/pay.css";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params.id as string;
  const [amount, setAmount] = useState<string>("0");
  const [desc, setDesc] = useState<string>("");

  useEffect(() => {
    const amt = searchParams.get('amount');
    const d = searchParams.get('desc');
    if (amt) setAmount(amt);
    if (d) setDesc(d);
  }, [searchParams]);

  return (
    <div className="success-container">
      <div className="success-circle">
        <Check size={48} strokeWidth={3} />
      </div>
      
      <h1 style={{ fontFamily: 'Sora', fontSize: '28px', marginBottom: '8px' }}>Payment Successful!</h1>
      <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '32px' }}>John Doe has received your fare instantly.</p>

      <div className="receipt-card">
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Amount Paid
        </div>
        <div style={{ fontFamily: 'Sora', fontSize: '40px', fontWeight: 700, marginBottom: '24px' }}>
          ₦{Number(amount).toLocaleString()}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px', fontSize: '14px' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>Driver</span>
          <span style={{ fontWeight: 600 }}>John Doe (ID: {id?.toUpperCase() || "LAG 123 XY"})</span>
        </div>
        
        {desc && (
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', fontSize: '14px' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Description</span>
            <span style={{ fontWeight: 600 }}>{desc}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', fontSize: '14px' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>Status</span>
          <span style={{ fontWeight: 600, color: '#2ECC71' }}>Delivered to Wema</span>
        </div>
      </div>

      <button 
        onClick={() => router.push('/landing')}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff',
          padding: '16px 32px',
          borderRadius: '999px',
          fontFamily: 'Sora',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Done
      </button>
    </div>
  );
}
