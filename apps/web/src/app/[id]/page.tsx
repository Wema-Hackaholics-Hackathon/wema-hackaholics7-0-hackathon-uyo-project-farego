"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { ButtonLoader, PageLoader } from "../../components/Loading";
import "../pay/pay.css";
import "../signup/signup.css"; // Reuse button styles

export default function PassengerPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [driver, setDriver] = useState<{
    fullName: string;
    publicId: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    api<{ fullName: string; publicId: string }>(`/api/drivers/${id}`)
      .then(setDriver)
      .catch((requestError) =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Driver not found",
        ),
      );
  }, [id]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(amount) <= 0 || !driver) return;
    setLoading(true);
    setError("");
    try {
      const payment = await api<{
        id: string;
        orderId: string;
        checkout: {
          mode: "mock" | "alatpay";
          publicKey?: string;
          businessId?: string;
        };
      }>("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          driverPublicId: id,
          amount: Number(amount),
          description: description || undefined,
          customerName: "FareGo Passenger",
          customerEmail: "passenger@farego.demo",
        }),
      });

      if (payment.checkout.mode === "mock") {
        await api(`/api/payments/${payment.id}/mock-complete`, {
          method: "POST",
        });
        router.push(`/${id}/success?paymentId=${payment.id}`);
        return;
      }

      await loadAlatPay();
      const popup = window.Alatpay!.setup({
        apiKey: payment.checkout.publicKey!,
        businessId: payment.checkout.businessId!,
        email: "passenger@farego.demo",
        firstName: "FareGo",
        lastName: "Passenger",
        currency: "NGN",
        amount: Number(amount),
        metadata: JSON.stringify({
          orderId: payment.orderId,
          paymentId: payment.id,
        }),
        onTransaction: () =>
          router.push(`/${id}/success?paymentId=${payment.id}`),
        onClose: () => setLoading(false),
      });
      popup.show();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Payment could not be started",
      );
      setLoading(false);
    }
  };

  const initials =
    driver?.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "FG";

  if (!driver && !error) {
    return (
      <PageLoader
        title="Finding your driver"
        message="Preparing a secure FareGo payment page."
      />
    );
  }

  return (
    <div className="pay-container">
      <header className="pay-header">
        <div className="pay-logo">FareGo</div>
        <div className="driver-info">
          <div className="driver-avatar">{initials}</div>
          <h2 className="driver-name">
            {driver ? `Paying ${driver.fullName}` : "Finding your driver…"}
          </h2>
          <div className="driver-plate">
            ID: {id?.toUpperCase() || "LAG 123 XY"}
          </div>
        </div>
      </header>

      <div className="pay-card">
        {error && (
          <p role="alert" style={{ color: "#b42318" }}>
            {error}
          </p>
        )}
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

          <div
            className="form-group"
            style={{ textAlign: "left", marginBottom: "24px" }}
          >
            <label className="form-label" style={{ fontSize: "12px" }}>
              Description (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Passenger Fare, Baggage Fee"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ fontSize: "14px", padding: "12px" }}
            />
          </div>

          <div className="alat-badge">
            <ShieldCheck size={16} /> Secured by ALAT
          </div>

          <button
            type="submit"
            className="btn-submit"
            disabled={!amount || !driver || loading}
          >
            {loading ? (
              <ButtonLoader label="Opening secure payment" />
            ) : (
              <>
                Pay Now <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>
      </div>

      <p
        style={{
          textAlign: "center",
          color: "var(--muted)",
          fontSize: "13px",
          marginTop: "32px",
          padding: "0 24px",
        }}
      >
        No app download required. Choose your payment method securely on the
        next step.
      </p>
    </div>
  );
}

async function loadAlatPay() {
  if (window.Alatpay) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://web.alatpay.ng/js/alatpay.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load ALATPay checkout"));
    document.head.appendChild(script);
  });
}

declare global {
  interface Window {
    Alatpay?: {
      setup(options: Record<string, unknown>): { show(): void };
    };
  }
}
