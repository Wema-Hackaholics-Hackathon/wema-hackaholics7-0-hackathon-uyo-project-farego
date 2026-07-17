"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

const onboardingSteps = [
  {
    title: "Sign up in minutes",
    description: "Phone number, OTP, basic details. Your Wema account is created automatically — no branch visit needed.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48 }}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    title: "Show your QR",
    description: "A code for your vehicle. Passengers scan it, or dial USSD if they don't have data.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48 }}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <rect x="7" y="7" width="3" height="3" />
        <rect x="14" y="7" width="3" height="3" />
        <rect x="7" y="14" width="3" height="3" />
        <rect x="14" y="14" width="3" height="3" />
      </svg>
    ),
  },
  {
    title: "Funds land instantly",
    description: "Real-time SMS and app confirmation the moment payment clears — no waiting, no screenshots.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 48, height: 48 }}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <path d="M7 15h.01" />
        <path d="M11 15h2" />
      </svg>
    ),
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/signup");
    }
  };

  const currentStep = onboardingSteps[step];

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "var(--page-bg)",
      padding: "40px 24px"
    }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button 
          onClick={() => router.push("/signup")}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            fontWeight: 600,
            fontSize: "15px",
            cursor: "pointer"
          }}
        >
          Skip
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: "120px",
          height: "120px",
          borderRadius: "24px",
          backgroundColor: "var(--purple)",
          color: "var(--gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "40px",
          boxShadow: "0 16px 30px -10px rgba(91,42,134,0.3)"
        }}>
          {currentStep.icon}
        </div>

        <h2 style={{
          fontFamily: "var(--font-sora)",
          fontSize: "28px",
          fontWeight: 700,
          color: "var(--ink)",
          textAlign: "center",
          marginBottom: "16px",
          letterSpacing: "-0.02em"
        }}>
          {currentStep.title}
        </h2>
        
        <p style={{
          fontFamily: "var(--font-inter)",
          fontSize: "16px",
          color: "var(--muted)",
          textAlign: "center",
          lineHeight: 1.6,
          maxWidth: "320px"
        }}>
          {currentStep.description}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "32px", paddingBottom: "20px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          {onboardingSteps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? "24px" : "8px",
                height: "8px",
                borderRadius: "4px",
                backgroundColor: i === step ? "var(--purple)" : "var(--border)",
                transition: "all 0.3s ease"
              }}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          style={{
            width: "100%",
            maxWidth: "320px",
            background: "var(--gold)",
            color: "var(--ink)",
            border: "none",
            padding: "16px",
            borderRadius: "16px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 14px 24px -10px rgba(240,180,41,0.6)",
            transition: "transform 0.15s ease",
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          {step === onboardingSteps.length - 1 ? "Get Started" : "Next"}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
