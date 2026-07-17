# [Project Title]

## Team Members

- Peters Ledum Favour
- Praise

---

## 🚀 Live Demo

- **Live Application:** [Link to your deployed Vercel/Netlify/Render URL]
- **Backend API:** [Link to your live backend API endpoint URL, if separate]
- **Recorded Demo:** [Link to your recorded demo explaining how your solution works using Loom].

---

## 🎯 The Problem

How might we help informal transport operators in Nigeria move from cash-based transactions into the formal financial system without disrupting how they earn and receive payments every day?

> **Example:** Many Keke riders, bus drivers, and other informal transport operators rely heavily on cash because it is fast, familiar, and easy to access. Although some already own bank accounts, those accounts are often disconnected from their daily income.

Existing digital payment methods may require passengers to request account numbers, wait for transfer confirmation, deal with poor internet connectivity, or rely on payment screenshots. This makes cash feel more reliable than formal financial services.

## ✨ Our Solution

FareGo is a digital payment and financial inclusion platform designed for informal transport operators in Nigeria.

**Example:**
"Our project, 'TaskMaster,' is a clean and simple to-do list application. It allows users to add tasks, mark them as complete, and sort them by priority. The goal is to provide a straightforward tool to help users stay organized."

---

## 🛠️ Tech Stack

_List the major technologies, frameworks, and platforms you used to build your project._

- **Frontend:** (e.g., React, Next.js, Tailwind CSS)
- **Backend:** (e.g., Node.js with Serverless Functions on Vercel)
- **Database:** (e.g., PostgreSQL via Supabase)
- **Deployment:** (e.g., Vercel)
- **AI/APIs:** (e.g., Google Gemini API)

---

## ⚙️ How to Set Up and Run Locally (Optional)

1. Copy `apps/backend/.env.example` to `apps/backend/.env` and add the Supabase
   PostgreSQL connection string.
2. Copy `apps/web/.env.example` to `apps/web/.env.local`.
3. Run `pnpm install`, `pnpm --filter @farego/backend db:generate`, and
   `pnpm --filter @farego/backend db:migrate`.
4. Run the API and web app with `pnpm dev`.

The demo uses OTP `123456`, mock Wema account issuance, and mock ALATPay payments
unless their corresponding environment settings are changed. Never commit database
passwords or ALATPay secret keys. Rotate any credential that has previously appeared
in a tracked file.

**Example:**

1.  Clone the repository:
    ```bash
    git clone https://github.com/Wema-Hackaholics-Hackathon/wema-hackaholics7-0-hackathon-uyo-project-farego.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd farego
    ```
3.  Install dependencies:
    ```bash
    pnpm install
    ```
4.  Create a `.env.local` file and add the necessary environment variables:
    ```

    ```

# Supabase Postgres connection (use the transaction pooler for the running API)

DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@HOST:6543/postgres?pgbouncer=true"

# Supabase direct/session connection used by Prisma migrations.

DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@HOST:5432/postgres"

PORT=4000
WEB_ORIGIN="http://localhost:3000"
PUBLIC_WEB_URL="http://localhost:3000"

# Demo authentication

MOCK_OTP_CODE="123456"
OTP_TTL_MINUTES=10
SESSION_TTL_DAYS=7

# Keep mock mode until ALATPay merchant credentials are available.

PAYMENT_PROVIDER="mock"
ALATPAY_BASE_URL="https://apibox.alatpay.ng"
ALATPAY_PUBLIC_KEY=""
ALATPAY_SECRET_KEY=""
ALATPAY_BUSINESS_ID=""
ALATPAY_WEBHOOK_SECRET=""

    ```

5.  Run the development server:
    ```bash
    pnpm run dev
    ```
