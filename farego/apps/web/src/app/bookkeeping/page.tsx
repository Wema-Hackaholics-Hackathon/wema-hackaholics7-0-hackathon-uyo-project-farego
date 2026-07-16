"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Calculator, TrendingUp, TrendingDown, ChevronRight, Activity } from "lucide-react";
import "./bookkeeping.css";
import "../dashboard/dashboard.css"; // Reuse bottom nav styles

export default function BookkeepingPage() {
  // Mock daily earnings passed over from dashboard
  const dailyEarnings = 14500;
  
  const [fuel, setFuel] = useState<number | "">("");
  const [repairs, setRepairs] = useState<number | "">("");
  const [tickets, setTickets] = useState<number | "">("");

  // Calculations
  const totalExpenses = (Number(fuel) || 0) + (Number(repairs) || 0) + (Number(tickets) || 0);
  const netProfit = dailyEarnings - totalExpenses;
  const profitMargin = dailyEarnings > 0 ? Math.round((netProfit / dailyEarnings) * 100) : 0;

  return (
    <div className="bookkeeping-container">
      <header className="bk-header">
        <h1 className="bk-title">Daily Bookkeeping</h1>
        <p className="bk-sub">Track your expenses and view your net profit.</p>
      </header>

      <div className="net-profit-card">
        <div className="net-profit-label">Net Profit Today</div>
        <h2 className="net-profit-amount">
          <span style={{ fontSize: '24px', opacity: 0.8 }}>₦</span>
          {netProfit.toLocaleString()}
        </h2>
        <div className="net-profit-rate" style={{ color: profitMargin >= 50 ? '#2ECC71' : profitMargin > 0 ? '#F0B429' : '#E74C3C' }}>
          {profitMargin >= 50 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {profitMargin}% Profit Margin
        </div>
      </div>

      <div className="bk-card">
        <h3 className="bk-card-title">
          <Activity size={18} color="var(--purple)" /> 
          Earnings Overview
        </h3>
        <div className="bk-stat-row">
          <span className="bk-stat-label">Total Fares Received</span>
          <span className="bk-stat-value">₦{dailyEarnings.toLocaleString()}</span>
        </div>
        <div className="bk-stat-row">
          <span className="bk-stat-label">Total Expenses</span>
          <span className="bk-stat-value negative">-₦{totalExpenses.toLocaleString()}</span>
        </div>
      </div>

      <div className="bk-card">
        <h3 className="bk-card-title">Log Expenses</h3>
        <form className="expense-form" onSubmit={(e) => e.preventDefault()}>
          <div className="expense-input-group">
            <label className="expense-label">Fuel</label>
            <div className="expense-input-wrapper">
              <span className="expense-currency">₦</span>
              <input 
                type="number" 
                className="expense-input" 
                placeholder="0"
                value={fuel}
                onChange={(e) => setFuel(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="expense-input-group">
            <label className="expense-label">Agbero / Union Tickets</label>
            <div className="expense-input-wrapper">
              <span className="expense-currency">₦</span>
              <input 
                type="number" 
                className="expense-input" 
                placeholder="0"
                value={tickets}
                onChange={(e) => setTickets(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="expense-input-group">
            <label className="expense-label">Maintenance / Repairs</label>
            <div className="expense-input-wrapper">
              <span className="expense-currency">₦</span>
              <input 
                type="number" 
                className="expense-input" 
                placeholder="0"
                value={repairs}
                onChange={(e) => setRepairs(Number(e.target.value))}
              />
            </div>
          </div>
        </form>
      </div>

      <nav className="bottom-nav">
        <Link href="/dashboard" className="nav-item">
          <Home size={24} />
          Home
        </Link>
        <Link href="/bookkeeping" className="nav-item active">
          <Calculator size={24} />
          Bookkeeping
        </Link>
      </nav>
    </div>
  );
}
