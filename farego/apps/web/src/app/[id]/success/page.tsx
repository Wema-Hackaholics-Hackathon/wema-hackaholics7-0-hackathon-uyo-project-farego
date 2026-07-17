"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Check } from "lucide-react";
import { api } from "../../../lib/api";
import { PageLoader } from "../../../components/Loading";
import "../../pay/pay.css";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = params.id as string;
  const [payment, setPayment] = useState<{
    amount: number;
    description?: string;
    status: string;
    driver: { fullName: string };
  } | null>(null);
  const [error, setError] = useState("");
  const paymentId = searchParams.get("paymentId");

  useEffect(() => {
    if (!paymentId) return;
    let attempts = 0;
    const load = async () => {
      try {
        const result = await api<typeof payment>(`/api/payments/${paymentId}`);
        setPayment(result);
        attempts += 1;
        if (result?.status === "COMPLETED") {
          window.clearInterval(interval);
        } else if (result?.status === "FAILED" || result?.status === "CANCELLED") {
          setError("This payment was not completed. Please return and try again.");
          window.clearInterval(interval);
        } else if (attempts >= 20) {
          setError("Payment confirmation is taking longer than expected. Please check again shortly.");
          window.clearInterval(interval);
        }
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Could not verify payment");
        window.clearInterval(interval);
      }
    };
    const interval = window.setInterval(load, 1500);
    void load();
    return () => window.clearInterval(interval);
  }, [paymentId]);

  if (!paymentId) return <div className="success-container"><p role="alert">Payment reference is missing</p></div>;
  if (error) return <div className="success-container"><p role="alert">{error}</p></div>;
  if (!payment || payment.status !== "COMPLETED") {
    return <PageLoader light title="Confirming your payment" message="Waiting for secure confirmation from ALATPay." />;
  }

  return (
    <div className="success-container">
      <div className="success-circle">
        <Check size={48} strokeWidth={3} />
      </div>
      
      <h1 style={{ fontFamily: 'Sora', fontSize: '28px', marginBottom: '8px' }}>Payment Successful!</h1>
      <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '32px' }}>{payment.driver.fullName} has received your fare instantly.</p>

      <div className="receipt-card">
        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
          Amount Paid
        </div>
        <div style={{ fontFamily: 'Sora', fontSize: '40px', fontWeight: 700, marginBottom: '24px' }}>
          ₦{payment.amount.toLocaleString("en-NG")}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '16px', fontSize: '14px' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>Driver</span>
          <span style={{ fontWeight: 600 }}>{payment.driver.fullName} (ID: {id?.toUpperCase()})</span>
        </div>
        
        {payment.description && (
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', fontSize: '14px' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Description</span>
            <span style={{ fontWeight: 600 }}>{payment.description}</span>
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
