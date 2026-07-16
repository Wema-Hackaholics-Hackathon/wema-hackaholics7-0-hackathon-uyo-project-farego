"use client";

import { useState } from "react";
import Link from "next/link";
import { QrCode, Check, X, Settings, Home, Calculator, Download, Banknote, ShieldAlert } from "lucide-react";
import "./dashboard.css";

const recentTransactions = [
  { id: 1, name: "Passenger Fare", amount: "₦500", time: "Just now" },
  { id: 2, name: "Passenger Fee", amount: "₦400", time: "5 mins ago" },
  { id: 3, name: "Passenger Fare", amount: "₦1,200", time: "12 mins ago" },
  { id: 4, name: "Passenger Fee", amount: "₦500", time: "30 mins ago" },
  { id: 5, name: "Passenger Fare", amount: "₦500", time: "1 hr ago" },
];

export default function Dashboard() {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  return (
    <div className="dashboard-container">
      <div className="bg-circle-1"></div>
      <div className="bg-circle-2"></div>

      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Good morning,</h1>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: '14px' }}>John Doe</p>
          <Link href="/kyc" className="kyc-badge">
            <ShieldAlert size={12} />
            KYC Level: Basic
          </Link>
        </div>
        <div className="dashboard-user">
          <Settings size={24} color="var(--muted)" />
          <div className="avatar">JD</div>
        </div>
      </header>

      <div className="earnings-card">
        <div className="earnings-label">Today's Earnings</div>
        <h2 className="earnings-amount">
          <span>₦</span>14,500
        </h2>
      </div>

      <div className="action-buttons">
        <button className="btn-qr" onClick={() => setShowQrModal(true)}>
          <QrCode size={20} />
          Show QR
        </button>
        <button className="btn-withdraw" onClick={() => setShowWithdrawModal(true)}>
          <Banknote size={20} />
          Withdraw
        </button>
      </div>

      <div className="recent-fares-header">
        <h3 className="recent-fares-title">Recent Fares</h3>
        <Link href="#" className="recent-fares-link">View all</Link>
      </div>

      <div className="transaction-list" style={{ paddingBottom: '100px' }}>
        {recentTransactions.map((tx) => (
          <div key={tx.id} className="transaction-item">
            <div className="transaction-left">
              <div className="transaction-icon">
                <Check size={20} strokeWidth={3} />
              </div>
              <div className="transaction-info">
                <span className="transaction-name">{tx.name}</span>
                <span className="transaction-time">{tx.time}</span>
              </div>
            </div>
            <div className="transaction-amount">+{tx.amount}</div>
          </div>
        ))}
      </div>

      <nav className="bottom-nav">
        <Link href="/dashboard" className="nav-item active">
          <Home size={24} />
          Home
        </Link>
        <Link href="/bookkeeping" className="nav-item">
          <Calculator size={24} />
          Bookkeeping
        </Link>
      </nav>

      {showQrModal && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowQrModal(false)}>
              <X size={24} />
            </button>
            <h2 style={{ fontFamily: 'Sora', color: 'var(--ink)', marginBottom: '8px' }}>Receive Fare</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>
              Passengers can scan this QR code or dial the USSD below.
            </p>
            
            <div className="qr-code-placeholder">
              <QrCode size={120} color="var(--purple)" />
            </div>
            
            <p style={{ color: 'var(--muted)', fontSize: '14px', margin: 0 }}>Or dial USSD:</p>
            <div className="ussd-box">*945*000*500#</div>

            <button className="btn-download-qr" onClick={() => alert('Downloading QR Code...')}>
              <Download size={18} /> Download Code
            </button>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowWithdrawModal(false)}>
              <X size={24} />
            </button>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--purple)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Banknote size={32} />
            </div>
            <h2 style={{ fontFamily: 'Sora', color: 'var(--ink)', marginBottom: '8px' }}>Withdraw Funds</h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
              Your FareGo app is linked to your automatically generated Wema/ALAT account. To withdraw or transfer funds:
            </p>
            
            <div style={{ background: 'var(--page-bg)', padding: '16px', borderRadius: '12px', textAlign: 'left', width: '100%', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 8px' }}>1. Use Wema USSD</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>Dial <b>*945#</b> from your registered phone number.</p>
            </div>

            <div style={{ background: 'var(--page-bg)', padding: '16px', borderRadius: '12px', textAlign: 'left', width: '100%' }}>
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)', margin: '0 0 8px' }}>2. Use ALAT App</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>Log into the ALAT by Wema app using your phone number to access your account completely.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
