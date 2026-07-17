"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Calculator,
  Home,
  Plus,
  ReceiptText,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { api } from "../../lib/api";
import { ButtonLoader, PageLoader } from "../../components/Loading";
import "./bookkeeping.css";
import "../dashboard/dashboard.css";

type ExpenseCategory = "FUEL" | "UNION_TICKET" | "MAINTENANCE" | "OTHER";

type BookkeepingData = {
  driver: { fullName: string };
  earnings: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  expenses: Array<{
    id: string;
    category: ExpenseCategory;
    amount: number;
    note: string | null;
    incurredAt: string;
  }>;
};

const categoryLabels: Record<ExpenseCategory, string> = {
  FUEL: "Fuel",
  UNION_TICKET: "Agbero / Union Ticket",
  MAINTENANCE: "Maintenance / Repairs",
  OTHER: "Other",
};

export default function BookkeepingPage() {
  const [data, setData] = useState<BookkeepingData | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("FUEL");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadBookkeeping = async () => {
    try {
      setData(await api<BookkeepingData>("/api/bookkeeping"));
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load bookkeeping");
    }
  };

  useEffect(() => {
    let active = true;
    api<BookkeepingData>("/api/bookkeeping")
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load bookkeeping");
      });
    return () => { active = false; };
  }, []);

  const addExpense = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    setSaving(true);
    setError("");
    try {
      await api("/api/bookkeeping/expenses", {
        method: "POST",
        body: JSON.stringify({ category, amount: parsedAmount, note: note.trim() || undefined }),
      });
      setAmount("");
      setNote("");
      setCategory("FUEL");
      setShowAddExpense(false);
      await loadBookkeeping();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save expense");
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (id: string) => {
    setDeletingId(id);
    setError("");
    try {
      await api(`/api/bookkeeping/expenses/${id}`, { method: "DELETE" });
      await loadBookkeeping();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not delete expense");
    } finally {
      setDeletingId(null);
    }
  };

  if (!data && !error) {
    return <PageLoader title="Loading your books" message="Calculating today’s earnings and expenses." />;
  }

  if (!data) {
    return <div className="bookkeeping-container"><p role="alert">{error}</p><Link href="/login">Sign in again</Link></div>;
  }

  return (
    <div className="bookkeeping-container">
      <header className="bk-header">
        <div>
          <h1 className="bk-title">Daily Bookkeeping</h1>
          <p className="bk-sub">{data.driver.fullName}, track today&apos;s expenses and net profit.</p>
        </div>
        <button className="bk-add-button" type="button" onClick={() => setShowAddExpense(true)}>
          <Plus size={18} /> Add expense
        </button>
      </header>

      {error && <p className="bk-error" role="alert">{error}</p>}

      <div className="net-profit-card">
        <div className="net-profit-label">Net Profit Today</div>
        <h2 className="net-profit-amount">
          <span>₦</span>{data.netProfit.toLocaleString("en-NG")}
        </h2>
        <div className="net-profit-rate" data-profit={data.profitMargin >= 50 ? "good" : data.profitMargin > 0 ? "fair" : "low"}>
          {data.profitMargin >= 50 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {data.profitMargin}% Profit Margin
        </div>
      </div>

      <div className="bk-card">
        <h3 className="bk-card-title"><Activity size={18} color="var(--purple)" /> Earnings Overview</h3>
        <div className="bk-stat-row">
          <span className="bk-stat-label">Fares received today</span>
          <span className="bk-stat-value">₦{data.earnings.toLocaleString("en-NG")}</span>
        </div>
        <div className="bk-stat-row">
          <span className="bk-stat-label">Expenses today</span>
          <span className="bk-stat-value negative">−₦{data.totalExpenses.toLocaleString("en-NG")}</span>
        </div>
      </div>

      <div className="bk-card">
        <div className="bk-expense-heading">
          <h3 className="bk-card-title"><ReceiptText size={18} color="var(--purple)" /> Today&apos;s Expenses</h3>
          <span>{data.expenses.length}</span>
        </div>
        {data.expenses.length === 0 ? (
          <div className="bk-empty-state">
            <ReceiptText size={28} />
            <strong>No expenses added today</strong>
            <p>Add fuel, tickets, repairs, or another business expense.</p>
          </div>
        ) : (
          <div className="expense-list">
            {data.expenses.map((expense) => (
              <div className="expense-item" key={expense.id}>
                <div className="expense-item-info">
                  <strong>{categoryLabels[expense.category]}</strong>
                  <span>{expense.note || new Date(expense.incurredAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="expense-item-actions">
                  <strong>−₦{expense.amount.toLocaleString("en-NG")}</strong>
                  <button type="button" aria-label={`Delete ${categoryLabels[expense.category]} expense`} disabled={deletingId === expense.id} onClick={() => void deleteExpense(expense.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="bottom-nav">
        <Link href="/dashboard" className="nav-item"><Home size={24} />Home</Link>
        <Link href="/bookkeeping" className="nav-item active"><Calculator size={24} />Bookkeeping</Link>
      </nav>

      {showAddExpense && (
        <div className="modal-overlay" onClick={() => !saving && setShowAddExpense(false)}>
          <div className="modal-content expense-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" aria-label="Close" disabled={saving} onClick={() => setShowAddExpense(false)}><X size={22} /></button>
            <h2>Add an expense</h2>
            <p>Save an expense to {data.driver.fullName}&apos;s daily bookkeeping.</p>
            <form className="expense-form" onSubmit={addExpense}>
              <label className="expense-input-group">
                <span className="expense-label">Category</span>
                <select className="expense-input" value={category} onChange={(event) => setCategory(event.target.value as ExpenseCategory)}>
                  {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="expense-input-group">
                <span className="expense-label">Amount</span>
                <div className="expense-input-wrapper"><span className="expense-currency">₦</span><input className="expense-input" type="number" inputMode="decimal" min="1" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" required autoFocus /></div>
              </label>
              <label className="expense-input-group">
                <span className="expense-label">Note (optional)</span>
                <input className="expense-input expense-note-input" type="text" maxLength={140} value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Full tank before morning shift" />
              </label>
              <button className="btn-submit" type="submit" disabled={saving || Number(amount) <= 0}>
                {saving ? <ButtonLoader label="Saving expense" /> : <><Plus size={18} /> Add expense</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
