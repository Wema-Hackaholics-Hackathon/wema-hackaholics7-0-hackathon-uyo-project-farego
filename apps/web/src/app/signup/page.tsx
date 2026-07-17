"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ArrowLeft,
  Building2,
  UserCircle2,
} from "lucide-react";
import { api } from "../../lib/api";
import { ButtonLoader } from "../../components/Loading";
import { isFullName, isNigerianPhone, isOtp, isWemaAccount } from "../../lib/validation";
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const goForward = (nextStep: Step) => setHistory([...history, nextStep]);
  const goBack = () => setHistory(history.slice(0, -1));

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFullName(name)) {
      setError("Enter your first and last name using letters only.");
      return;
    }
    setName(name.trim().replace(/\s+/g, " "));
    setError("");
    goForward("HAS_WEMA");
  };

  const handleWemaAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isWemaAccount(wemaAccount)) {
      setError("Enter a valid 10-digit Wema account number.");
      return;
    }
    setError("");
    goForward("PHONE");
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNigerianPhone(phone)) {
      setError("Enter a valid Nigerian mobile number, for example 08012345678.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api("/api/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      goForward("OTP");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not send OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const nextOtp = [...otp];
      if (nextOtp[index]) {
        nextOtp[index] = "";
        setOtp(nextOtp);
        if (index > 0) document.getElementById(`otp-${index - 1}`)?.focus();
      } else if (index > 0) {
        nextOtp[index - 1] = "";
        setOtp(nextOtp);
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
    if (event.key === "ArrowRight" && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    event.preventDefault();
    setOtp(Array.from({ length: 6 }, (_, index) => digits[index] || ""));
    document.getElementById(`otp-${Math.min(digits.length, 6) - 1}`)?.focus();
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtp(otp.join(""))) {
      setError("Enter the complete 6-digit verification code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const verified = await api<{ token: string; driverExists: boolean }>(
        "/api/auth/otp/verify",
        {
          method: "POST",
          body: JSON.stringify({ phone, code: otp.join("") }),
        },
      );
      localStorage.setItem("farego_token", verified.token);
      if (verified.driverExists) {
        router.push("/dashboard");
        return;
      }
      await api("/api/drivers/register", {
        method: "POST",
        body: JSON.stringify({ fullName: name, consent: true }),
      });
      goForward("SUCCESS");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not complete registration",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {error && (
          <p
            role="alert"
            style={{
              color: "#b42318",
              background: "#fef3f2",
              padding: "12px",
              borderRadius: "10px",
            }}
          >
            {error}
          </p>
        )}
        {history.length > 1 && step !== "SUCCESS" && (
          <button
            type="button"
            onClick={goBack}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              marginBottom: "24px",
              padding: 0,
            }}
          >
            <ArrowLeft size={20} />
            <span style={{ fontSize: "14px", fontWeight: 600 }}>Back</span>
          </button>
        )}

        {step === "NAME" && (
          <form onSubmit={handleNameSubmit}>
            <div className="signup-header">
              <h1 className="signup-title">Get Started</h1>
              <p className="signup-sub">
                Tell us your name to create your FareGo account.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                minLength={3}
                maxLength={100}
                autoComplete="name"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-submit">
              Continue <ArrowRight size={20} />
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.push("/login")}
            >
              Already have an account? Log in
            </button>
          </form>
        )}

        {step === "HAS_WEMA" && (
          <div>
            <div className="signup-header">
              <h1 className="signup-title">Bank Details</h1>
              <p className="signup-sub">
                Do you already have a{" "}
                <span style={{ fontWeight: 800 }}>Wema Bank</span> or{" "}
                <span style={{ fontWeight: 800 }}>ALAT</span> account?
              </p>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <button
                type="button"
                className="btn-submit"
                style={{
                  background: "#fff",
                  color: "var(--ink)",
                  border: "1.5px solid var(--border)",
                  boxShadow: "none",
                }}
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
              <p className="signup-sub">
                Enter your 10-digit Wema Bank account number.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input
                type="text"
                inputMode="numeric"
                className="form-input"
                placeholder="e.g. 0123456789"
                value={wemaAccount}
                onChange={(e) =>
                  { setWemaAccount(e.target.value.replace(/[^0-9]/g, "")); setError(""); }
                }
                maxLength={10}
                pattern="[0-9]{10}"
                autoComplete="off"
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
              <p className="signup-sub">
                Enter your phone number to automatically create a Wema account.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. 0801 234 5678"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                minLength={11}
                maxLength={17}
                autoComplete="tel"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <ButtonLoader label="Sending code" /> : <>Continue <ArrowRight size={20} /></>}
            </button>
          </form>
        )}

        {step === "OTP" && (
          <form onSubmit={handleOtpSubmit}>
            <div className="signup-header">
              <h1 className="signup-title">Verify Phone</h1>
              <p className="signup-sub">
                We&apos;ve sent a 6-digit code to {phone || "your number"}.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: "32px" }}>
              <div className="otp-container">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    className="otp-input"
                    value={digit}
                    onChange={(e) =>
                      handleOtpChange(i, e.target.value.replace(/[^0-9]/g, ""))
                    }
                    onKeyDown={(event) => handleOtpKeyDown(i, event)}
                    onPaste={handleOtpPaste}
                    maxLength={1}
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    required
                  />
                ))}
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <ButtonLoader label="Creating your account" /> : "Verify Code"}
            </button>
          </form>
        )}

        {step === "SUCCESS" && (
          <div style={{ textAlign: "center", paddingTop: "16px" }}>
            <div className="success-icon">
              <Check size={40} strokeWidth={3} />
            </div>
            <h1 className="signup-title">Account Ready!</h1>
            <p className="signup-sub" style={{ marginBottom: "32px" }}>
              Your Wema Bank account is fully set up and linked to FareGo.
              You&apos;re ready to receive instant digital fares.
            </p>
            <button
              className="btn-submit"
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
