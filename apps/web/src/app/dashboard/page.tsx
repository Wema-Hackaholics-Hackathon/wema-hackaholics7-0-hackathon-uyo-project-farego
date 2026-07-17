"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  QrCode,
  Check,
  X,
  Settings,
  Home,
  Calculator,
  Download,
  Banknote,
  ShieldAlert,
} from "lucide-react";
import QRCode from "qrcode";
import { api } from "../../lib/api";
import "./dashboard.css";
import { DashboardSkeleton } from "@/components/Loading";

type DashboardData = {
  driver: { publicId: string; fullName: string; kycLevel: string };
  wallet: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    balance: number;
  } | null;
  transactions: Array<{
    id: string;
    amount: number;
    description: string;
    createdAt: string;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    createdAt: string;
  }>;
};

export default function Dashboard() {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [posterDataUrl, setPosterDataUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const dashboard = await api<DashboardData>("/api/drivers/me/dashboard");
        if (!active) return;
        setData(dashboard);
        const paymentUrl = `${window.location.origin}/${dashboard.driver.publicId}`;
        const qr = await QRCode.toDataURL(paymentUrl, {
          width: 800,
          margin: 2,
          errorCorrectionLevel: "H",
          color: { dark: "#2D1452", light: "#FFFFFF" },
        });
        setPosterDataUrl(
          await createPaymentPoster(
            qr,
            dashboard.driver.fullName,
            dashboard.wallet?.accountNumber || "Not available",
            paymentUrl,
          ),
        );
      } catch (requestError) {
        if (active)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load dashboard",
          );
      }
    };
    void load();
    const interval = window.setInterval(load, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const downloadQr = () => {
    if (!posterDataUrl) return;
    const link = document.createElement("a");
    link.href = posterDataUrl;
    link.download = `farego-payment-poster-${data?.driver.publicId || "driver"}.png`;
    link.click();
  };

  if (error)
    return (
      <div className="dashboard-container">
        <p role="alert">{error}</p>
        <Link href="/signup">Sign in again</Link>
      </div>
    );
  if (!data) return <DashboardSkeleton />;

  const initials = data.driver.fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="dashboard-container">
      <div className="bg-circle-1"></div>
      <div className="bg-circle-2"></div>

      <header className="dashboard-header">
        <div className="dashboard-heading-group">
          <div>
            <h1 className="dashboard-title">Good morning,</h1>
            <p className="dashboard-driver-name">{data.driver.fullName}</p>
          </div>
          {/* <Link href="/kyc" className="kyc-badge">
            <ShieldAlert size={12} />
            KYC Level: {data.driver.kycLevel}
          </Link> */}
          <Link href="/kyc" className="kyc-badge">
            <ShieldAlert size={12} />
            Upgrade to KYC Level 2
          </Link>
        </div>
        <div className="dashboard-user">
          <Settings size={24} color="var(--muted)" />
          <div className="avatar">{initials}</div>
        </div>
      </header>

      {data.notifications[0] && (
        <div
          role="status"
          style={{
            background: "#ecfdf3",
            color: "#027a48",
            padding: "12px 16px",
            borderRadius: "12px",
            marginBottom: "16px",
          }}
        >
          <strong>{data.notifications[0].title}</strong> —{" "}
          {data.notifications[0].message}
        </div>
      )}

      <div className="earnings-card">
        <div className="earnings-card-header">
          <div>
            <div className="earnings-label">FareGo Wema Account</div>
            <div className="account-bank-name">
              {data.wallet?.bankName || "Wema Bank"}
            </div>
          </div>
          <span className="account-status">Active</span>
        </div>

        <div className="account-details">
          <div>
            <span className="account-detail-label">Account name</span>
            <strong>{data.wallet?.accountName || data.driver.fullName}</strong>
          </div>
          <div className="account-number-block">
            <span className="account-detail-label">Account number</span>
            <strong>{data.wallet?.accountNumber || "Not available"}</strong>
          </div>
        </div>

        <div className="balance-divider" />
        <div className="balance-label">Available balance</div>
        <h2 className="earnings-amount">
          <span>₦</span>
          {(data.wallet?.balance || 0).toLocaleString("en-NG")}
        </h2>
      </div>

      <div className="action-buttons">
        <button className="btn-qr" onClick={() => setShowQrModal(true)}>
          <QrCode size={20} />
          Show QR
        </button>
        <button
          className="btn-withdraw"
          onClick={() => setShowWithdrawModal(true)}
        >
          <Banknote size={20} />
          Withdraw
        </button>
      </div>

      <div className="recent-fares-header">
        <h3 className="recent-fares-title">Recent Fares</h3>
        <Link href="#" className="recent-fares-link">
          View all
        </Link>
      </div>

      <div className="transaction-list" style={{ paddingBottom: "100px" }}>
        {data.transactions.length === 0 && (
          <p style={{ color: "var(--muted)" }}>No fares received yet.</p>
        )}
        {data.transactions.map((tx) => (
          <div key={tx.id} className="transaction-item">
            <div className="transaction-left">
              <div className="transaction-icon">
                <Check size={20} strokeWidth={3} />
              </div>
              <div className="transaction-info">
                <span className="transaction-name">{tx.description}</span>
                <span className="transaction-time">
                  {new Date(tx.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="transaction-amount">
              +₦{tx.amount.toLocaleString("en-NG")}
            </div>
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
          <div
            className="modal-content qr-poster-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowQrModal(false)}
            >
              <X size={24} />
            </button>
            <h2
              style={{
                fontFamily: "Sora",
                color: "var(--ink)",
                marginBottom: "8px",
              }}
            >
              Your payment poster
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "14px",
                marginBottom: "24px",
              }}
            >
              Preview the print-ready banner passengers will scan to pay you.
            </p>

            <div className="payment-poster-preview">
              {posterDataUrl ? (
                <Image
                  unoptimized
                  src={posterDataUrl}
                  alt={`Printable FareGo payment poster for ${data.driver.fullName}`}
                  width={300}
                  height={400}
                />
              ) : (
                <QrCode size={120} />
              )}
            </div>

            <button className="btn-download-qr" onClick={downloadQr}>
              <Download size={18} /> Download print-ready poster
            </button>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowWithdrawModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowWithdrawModal(false)}
            >
              <X size={24} />
            </button>
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                background: "var(--purple)",
                color: "var(--gold)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <Banknote size={32} />
            </div>
            <h2
              style={{
                fontFamily: "Sora",
                color: "var(--ink)",
                marginBottom: "8px",
              }}
            >
              Withdraw Funds
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "14px",
                marginBottom: "24px",
                lineHeight: 1.6,
              }}
            >
              Your FareGo app is linked to your automatically generated
              Wema/ALAT account. To withdraw or transfer funds:
            </p>

            <div
              style={{
                background: "var(--page-bg)",
                padding: "16px",
                borderRadius: "12px",
                textAlign: "left",
                width: "100%",
                marginBottom: "16px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--ink)",
                  margin: "0 0 8px",
                }}
              >
                1. Use Wema USSD
              </p>
              <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
                Dial <b>*945#</b> from your registered phone number.
              </p>
            </div>

            <div
              style={{
                background: "var(--page-bg)",
                padding: "16px",
                borderRadius: "12px",
                textAlign: "left",
                width: "100%",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--ink)",
                  margin: "0 0 8px",
                }}
              >
                2. Use ALAT App
              </p>
              <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>
                Log into the ALAT by Wema app using your phone number to access
                your account completely.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function createPaymentPoster(
  qrDataUrl: string,
  driverName: string,
  accountNumber: string,
  paymentUrl: string,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1600;
  const context = canvas.getContext("2d");
  if (!context) return qrDataUrl;

  const gradient = context.createLinearGradient(0, 0, 1200, 1600);
  gradient.addColorStop(0, "#2D1452");
  gradient.addColorStop(0.55, "#5B2A86");
  gradient.addColorStop(1, "#7B3FB2");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(240, 180, 41, 0.16)";
  context.beginPath();
  context.arc(1090, 120, 330, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(80, 1510, 280, 0, Math.PI * 2);
  context.fill();

  context.textAlign = "center";
  context.fillStyle = "#F0B429";
  context.font = "700 76px Arial, sans-serif";
  context.fillText("FareGo", 600, 135);
  context.fillStyle = "#FFFFFF";
  context.font = "700 72px Arial, sans-serif";
  context.fillText("SCAN TO PAY YOUR FARE", 600, 245);
  context.fillStyle = "rgba(255,255,255,0.82)";
  context.font = "400 34px Arial, sans-serif";
  context.fillText(
    "Fast, secure and cashless payments with ALAT by Wema",
    600,
    305,
  );

  roundRect(context, 105, 365, 990, 980, 52);
  context.fillStyle = "#FFFFFF";
  context.fill();

  const qrImage = await loadCanvasImage(qrDataUrl);
  context.drawImage(qrImage, 260, 400, 680, 680);

  context.fillStyle = "#2D1452";
  context.font = "700 40px Arial, sans-serif";
  context.fillText(`Pay ${driverName}`, 600, 1135);
  context.fillStyle = "#5B2A86";
  context.font = "700 30px Arial, sans-serif";
  context.fillText(`Wema account: ${accountNumber}`, 600, 1185);

  context.fillStyle = "#6B5C78";
  context.font = "700 23px Arial, sans-serif";
  context.fillText("OR DIAL USSD", 600, 1240);
  roundRect(context, 245, 1260, 710, 62, 22);
  context.fillStyle = "#FFF4D6";
  context.fill();
  context.fillStyle = "#2D1452";
  context.font = "700 30px Arial, sans-serif";
  context.fillText(`*945*Amount*${accountNumber}#`, 600, 1302);

  context.fillStyle = "#FFFFFF";
  context.font = "700 34px Arial, sans-serif";
  context.fillText(
    "1. Open your camera  •  2. Scan the code  •  3. Enter fare",
    600,
    1415,
  );
  context.fillStyle = "rgba(255,255,255,0.8)";
  context.font = "400 25px Arial, sans-serif";
  context.fillText("No FareGo app required", 600, 1460);
  context.fillStyle = "#F0B429";
  context.font = "700 27px Arial, sans-serif";
  context.fillText("PAYMENT CONFIRMED INSTANTLY • SECURED BY ALAT", 600, 1525);

  context.fillStyle = "rgba(255,255,255,0.62)";
  context.font = "400 20px Arial, sans-serif";
  context.fillText(paymentUrl.replace(/^https?:\/\//, ""), 600, 1570);

  return canvas.toDataURL("image/png", 1);
}

function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not prepare the QR poster"));
    image.src = src;
  });
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}
