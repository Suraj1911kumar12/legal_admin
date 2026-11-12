# LegalDost — Lawyer Web Panel

A dedicated, high-performance web application designed for licensed advocates and legal practitioners to manage their professional profile, review and accept client legal queries, manage ongoing legal matters, communicate via privileged messaging channels, schedule and conduct consultations, and verify submitted case evidence.

---

## 1. Features

- **Advocate Authentication & Secure Onboarding**:
  - JWT HttpOnly cookie authentication.
  - Multi-step registration capturing Bar Council enrollment number, statutory Bar body, state, experience, and chamber address.
  - Verification state tracking (`pending`, `under_review`, `verified`, `rejected`) with administrative protection of official credentials.
- **Incoming Citizen Queries**:
  - Structured query queue with AI-assisted intake digests (summary, confirmed facts, missing information, recommended next steps).
  - Concurrency-safe atomic query acceptance (preventing double assignments).
  - Query decline modal requiring a professional reason.
- **Legal Matters Docket**:
  - Active matter workspace with automated reference generation (e.g. `MAT-2026-XXXX`).
  - Strict confidentiality barrier: internal notes accessible strictly to counsel.
  - Client-facing milestone updates and progress tracking.
  - Task checklists and statutory court/hearing date management.
- **Client Communications**:
  - Direct, real-time message stream between client and counsel.
  - Matter linking and attachment support.
  - Automated read receipt tracking.
- **Consultation Scheduling**:
  - Multi-mode support: Video (Google Meet / WebRTC), Phone, and In-Person consultations.
  - Interactive appointment confirmation with meeting link generation.
  - Rescheduling and decline workflow with client notification.
- **Document & Evidence Verification**:
  - Centralized document repository.
  - File review statuses (`pending`, `reviewed`, `action_required`) with inline counsel annotations.
- **Notification Center**:
  - In-app notification center for new queries, messages, appointment updates, and system alerts.

---

## 2. Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Deep Navy `#172554` & Refined Gold `#C49A45` palette)
- **State Management**: TanStack React Query v5
- **Icons**: Lucide React
- **Validation**: Zod & React Hook Form

---

## 3. Environment Configuration

Create a `.env.local` file in the `lawyer-panel/` root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
PORT=3001
```

---

## 4. Getting Started

### Install Dependencies
```bash
cd lawyer-panel
npm install
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build for Production
```bash
npm run build
npm start
```

