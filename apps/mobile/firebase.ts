import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage),
// });
const auth = initializeAuth(app);

const db = getFirestore(app);

type NewsArticle = {
  title: string;
  description: string;
  url: string;
  urlToImage?: string | null;
  source?: string;
  publishedAt: Timestamp;
};

async function fetchAndStoreNews(
  keyword: string = "migrant workers Singapore",
  language: string = "en"
): Promise<void> {
  const apiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY;
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
    keyword
  )}&language=${language}&sortBy=publishedAt&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.articles || !Array.isArray(data.articles)) {
      console.warn("Unexpected NewsAPI response:", data);
      return;
    }

    for (const article of data.articles) {
      // Check for duplicate by URL
      const q = query(collection(db, "news"), where("url", "==", article.url));
      const existing = await getDocs(q);

      if (!existing.empty) {
        console.log("Duplicate article, skipping:", article.title);
        continue;
      }

      const newsDoc: NewsArticle = {
        title: article.title,
        description: article.description || "",
        url: article.url,
        urlToImage: article.urlToImage || null,
        source: article.source?.name || "",
        publishedAt: article.publishedAt
          ? Timestamp.fromDate(new Date(article.publishedAt))
          : Timestamp.now(),
      };

      await addDoc(collection(db, "news"), newsDoc);
      console.log("Added:", article.title);
    }

    console.log("News fetch complete.");
  } catch (error) {
    console.error("Failed to fetch or store news:", error);
  }
}

export { app, auth, db, fetchAndStoreNews };
