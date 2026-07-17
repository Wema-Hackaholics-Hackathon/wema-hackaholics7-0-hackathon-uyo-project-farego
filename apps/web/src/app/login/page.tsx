"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { api } from "../../lib/api";
import { ButtonLoader } from "../../components/Loading";
import "../signup/signup.css";

type Step = "PHONE" | "OTP";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/api/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      setStep("OTP");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.some((digit) => !digit)) return;
    setLoading(true);
    setError("");
    try {
      const result = await api<{ token: string; driverExists: boolean }>("/api/auth/otp/verify", {
        method: "POST",
        body: JSON.stringify({ phone, code: otp.join("") }),
      });
      if (!result.driverExists) {
        setError("No FareGo driver account exists for this phone number. Please register first.");
        return;
      }
      localStorage.setItem("farego_token", result.token);
      router.replace("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not log in");
    } finally {
      setLoading(false);
    }
  };

  const updateOtp = (index: number, value: string) => {
    if (value.length > 1) return;
    const nextOtp = [...otp];
    nextOtp[index] = value.replace(/\D/g, "");
    setOtp(nextOtp);
    if (value && index < 5) document.getElementById(`login-otp-${index + 1}`)?.focus();
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {step === "OTP" && (
          <button type="button" className="btn-secondary" onClick={() => { setStep("PHONE"); setError(""); }}>
            <ArrowLeft size={18} /> Change phone number
          </button>
        )}

        <div className="signup-header">
          <h1 className="signup-title">Welcome back</h1>
          <p className="signup-sub">
            {step === "PHONE" ? "Enter your registered phone number to log in." : `Enter the 6-digit code sent to ${phone}.`}
          </p>
        </div>

        {error && <p role="alert" style={{ color: "#b42318", background: "#fef3f2", padding: 12, borderRadius: 10 }}>{error}</p>}

        {step === "PHONE" ? (
          <form onSubmit={requestOtp}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-phone">Phone Number</label>
              <input id="login-phone" className="form-input" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. 0801 234 5678" minLength={10} required autoFocus />
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <ButtonLoader label="Sending code" /> : <>Continue <ArrowRight size={20} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <div className="otp-container" style={{ marginBottom: 32 }}>
              {otp.map((digit, index) => (
                <input key={index} id={`login-otp-${index}`} className="otp-input" inputMode="numeric" value={digit} onChange={(event) => updateOtp(index, event.target.value)} maxLength={1} required />
              ))}
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <ButtonLoader label="Logging you in" /> : "Log in"}
            </button>
          </form>
        )}

        <Link href="/signup" className="btn-secondary" style={{ display: "block", textAlign: "center", marginTop: 16 }}>
          New to FareGo? Register
        </Link>
      </div>
    </div>
  );
}
