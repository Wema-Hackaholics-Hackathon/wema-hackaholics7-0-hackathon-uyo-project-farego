"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to onboarding after 3 seconds
    const timer = setTimeout(() => {
      router.push("/onboarding");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "var(--purple-deep)",
        margin: 0,
        padding: 0,
      }}
    >
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
          .splash-logo {
            animation: pulse 2s ease-in-out infinite;
          }
        `}
      </style>
      <div
        className="splash-logo"
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "32px",
          backgroundColor: "var(--gold)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.4)",
          marginBottom: "24px",
        }}
      >
        <svg
          viewBox="0 0 240 240"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "64px", height: "64px" }}
        >
          <path
            d="M70 200 V70 a10 10 0 0 1 10 -10 H104 a10 10 0 0 1 10 10 V96 H130 a34 34 0 0 1 0 68 H104 V200 a10 10 0 0 1 -10 10 H80 a10 10 0 0 1 -10 -10 Z"
            fill="#5B2A86"
          />
          <rect x="130" y="112" width="16" height="16" rx="3" fill="#F0B429" />
          <circle cx="192" cy="196" r="9" fill="#5B2A86" />
        </svg>
      </div>
      <h1
        style={{
          fontFamily: "var(--font-sora)",
          color: "white",
          fontSize: "28px",
          fontWeight: 700,
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        Fare<span style={{ color: "var(--gold)" }}>Go</span>
      </h1>
      <p
        style={{
          color: "rgba(255,255,255,0.7)",
          fontFamily: "var(--font-inter)",
          fontSize: "14px",
          marginTop: "12px",
        }}
      >
        Instant Digital Fares
      </p>
    </div>
  );
}
