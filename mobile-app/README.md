# LegalDost Customer Mobile Application (`mobile-app/`)

Native iOS & Android customer application for **LegalDost**, built with **React Native 0.88**, **Expo SDK 58**, **Expo Router**, **TypeScript (strict mode)**, **TanStack Query**, **React Hook Form + Zod**, and **Reanimated 4**.

It connects directly via HTTP APIs (`/api/v1/customer/*`) to the shared LegalDost `backend/`. It does **not** connect directly to MongoDB and contains no admin or lawyer workflows.

---

## 1. Key Capabilities

- **Authentication & Security**:
  - Registration, login, forgot/reset password, password change, and account deletion request.
  - Short-lived access JWT + rotating refresh token stored in encrypted **Expo SecureStore** (with single-flight 401 token refresh handling).
- **Onboarding & Home Hub**:
  - 4-screen interactive citizen onboarding, welcome hub, and Home screen with *"How can LegalDost help you?"*, quick actions, *"Continue where you left off"*, offline draft resume banner, and contextual push permission prompt.
- **Guided Legal Problem Intake & Drafts**:
  - Step-by-step intake with everyday categories, example prompts, urgency & language selection, idempotent submission (`clientSubmissionKey`), and encrypted offline draft saving fallback when disconnected.
- **AI Legal Assistant & Possible Solutions**:
  - Multi-turn conversational AI guidance backed by `POST /api/v1/customer/ai/sessions` and `/messages`.
  - Structured plain-language explanation cards, source references, legal safety disclaimers, and side-by-side **Possible Solutions** comparison (*Continue on My Own* vs *Get Legal Help*).
  - Displays an honest unavailable notice if the server has no live AI API key configured (never fabricates fake AI legal advice).
- **Private Document Vault**:
  - Upload `PDF`, `JPG`, `JPEG`, and `PNG` files (max 10 MB) via native document picker or camera/photo library with upload progress & cancel support.
  - Downloads and previews documents securely via authorized `Authorization: Bearer <token>` requests + `expo-file-system` `File.preview(...)`.
- **My Matters, Verified Lawyers, Consultations & Messaging**:
  - Filterable matters list, full matter timeline, lawyer client-updates, checklist tasks, and important dates.
  - Verified Bar-registered lawyer directory with multi-criteria filters (practice area, city, language, consultation mode, min experience, max fee).
  - Real slot availability checker, consultation booking (`pending` confirmation / `accepted` / `cancelled`), and private lawyer messaging with document attachments and explicit matter-share consent.

---

## 2. Environment Setup

Create `mobile-app/.env` from `mobile-app/.env.example`:

```bash
cd mobile-app
cp .env.example .env
```

Environment variable:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Physical Device & Emulator URLs

- **Android Emulator**: `http://localhost:5000/api/v1` is automatically mapped by `src/services/api/apiClient.ts` to `http://10.0.2.2:5000/api/v1` so it reaches your host machine's `backend/` server.
- **iOS Simulator**: `http://localhost:5000/api/v1` works directly on macOS.
- **Physical Android / iOS Device via LAN**: Set `EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:5000/api/v1` (for example `http://192.168.1.42:5000/api/v1`) and ensure `backend/.env` allows your origin / device traffic on port `5000`.

---

## 3. Running Locally

```bash
# 1. Start the shared backend first (from Legal/backend)
cd backend
npm run dev

# 2. Start Expo dev server (from Legal/mobile-app)
cd ../mobile-app
npm install
npx expo start
```

Shortcuts:
- Press `a` in Expo CLI (or `npm run android`) to launch on Android Emulator.
- Press `i` (or `npm run ios`) for iOS Simulator.
- Scan QR code in Expo Go or your Development Build.

---

## 4. Verification & Quality Commands

```bash
cd mobile-app
npx tsc --noEmit
npm run lint
npx expo-doctor
npx expo install --check
```

---

## 5. Permissions Used (`app.json`)

- **Camera / Photo Library** (`expo-image-picker`): Only requested when uploading photos of legal notices or contracts.
- **Push Notifications** (`expo-notifications`): Prompted contextually after meaningful user activity (saved matters or consultations) rather than blocking initial app launch.
- **Storage / File Cache** (`expo-document-picker`, `expo-file-system`): Used for picking `PDF`/`JPG`/`PNG` uploads and caching authorized private previews temporarily.

---

## 6. Building for Android / iOS with EAS (`eas.json`)

`eas.json` defines `development`, `preview` (internal Android `.apk` distribution), and `production` (`app-bundle`) profiles:

```bash
npx eas build --platform android --profile preview
```

---

## 7. Troubleshooting

1. **Android Emulator cannot reach `localhost:5000`**:
   Ensure `backend/` is running on port `5000`. If using a physical device, `localhost` points to the phone itself — replace `EXPO_PUBLIC_API_URL` in `.env` with your computer's local Wi-Fi IP (`ipconfig` / `ifconfig`) and restart Metro with `npx expo start -c`.
2. **AI Assistant shows unavailable banner**:
   Configure `GEMINI_API_KEY` or `OPENAI_API_KEY` in `backend/.env` and restart the backend server.
3. **Push token registration returns null on emulator**:
   Expo push tokens require a physical device (`Device.isDevice`); emulators skip OS push registration gracefully without crashing.
