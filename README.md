# CareSpace
CareSpace is a mobile app that empowers migrant workers to report safety issues anonymously, stay updated with news and events, and connect with peers through community forums. It enhances safety, well-being, and social integration while giving workers a trusted, supportive space tailored to their needs.

---
## 📂 Directory Structure
---
```
CareSpace/
├─ apps/
│  ├─ admin/                  # Next.js + Tailwind (admin dashboard)
│  │  ├─ app/                 # App Router pages (Next 13+)
│  │  ├─ public/
│  │  ├─ lib/                 
│  │  ├─ package.json
│  │  └─ ...
│  └─ mobile/                 # Expo (React Native)
│     ├─ app.json
│     ├─ App.tsx
│     ├─ assets/
│     ├─ firebase.ts          
│     ├─ package.json
│     └─ ...
├─ services/
│  └─ functions/              # Firebase Cloud Functions (TS)
├─ .gitignore
├─ README.md
├─ firestore.rules            # Firestore security rules (checked-in)
└─ storage.rules              # Storage security rules (checked-in)
```
---
Tech Stack
- Frontend (Mobile): React Native (Expo) + TypeScript
- Frontend (Admin): Next.js (App Router) + TailwindCSS
- Backend: Firebase (Auth, Firestore, Storage, FCM, Functions)

---
## ▶️ Running the Frontends

### Admin (Next.js)
```bash
npm run dev
# open http://localhost:3000
```

### Mobile (Expo)

**Option A: Expo Go (fastest)**  
```bash
npm run android
# scan QR with Expo Go app on your phone
```

**Option B: Android emulator**  
1. Open Android Studio and start a Pixel emulator (API 34 (Upsidedown Cake) recommended)  
2. Run:
```bash
npm run android
```

**Optional: Web preview (for devs without emulator/phone)**  
```bash
npm -C apps/mobile exec expo install react-dom react-native-web @expo/metro-runtime
npm run web
```

---
