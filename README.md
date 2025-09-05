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
```
---
Tech Stack
- Frontend (Mobile): React Native (Expo) + TypeScript
- Frontend (Admin): Next.js (App Router) + TailwindCSS
- Backend: Firebase (Auth, Firestore)

---
## ▶️ Running the Frontends

### Admin (Next.js)
```bash
cd apps/admin
npm run dev
# open http://localhost:3000
```

### Mobile (Expo)

**Option A: Expo Go (fastest)**  
```bash
cd apps/mobile
npm run android
# scan QR with Expo Go app on your phone
```

**Option B: Android emulator**  
1. Open Android Studio and start a Pixel emulator (API 34 (Upsidedown Cake) recommended)  
2. Run:
```bash
npm run android
```

## 🔑 Deployment & Dependencies  
- **Firebase:** Auth, Firestore
- **Dependencies:** Listed in respective `package.json` files (`apps/admin`, `apps/mobile`, `services/functions`).  

---
## 👥 Authors & Contributions  
- Team/Author Name(s)  
- GitHub repo: [https://github.com/hibbychu/CareSpace.git]
- Additional contributors acknowledged in commit history.  

---

## 🗂️ Zipped Code Base  
The full code base (including this README) is provided as a zipped archive, to be used as an offline reference.  

---

✅ **Note:** All commits were made before **Saturday, 6th September 2025, 6pm** as per hackathon rules.  
