/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import fetch from "node-fetch";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const auth = admin.auth();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });
export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

admin.initializeApp();
const db = admin.firestore();

async function saveArticles(articles: any[]) {
  const batch = db.batch();
  const collectionRef = db.collection("news");

  articles.forEach((article) => {
    const docRef = collectionRef.doc();
    batch.set(docRef, {
      title: article.title,
      description: article.description,
      url: article.url,
      imageUrl: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source.name,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
}

async function fetchNewsArticles() {
  const NEWS_API_KEY =
    process.env.NEWS_API_KEY ||
    (process.env.FUNCTIONS_CONFIG
      ? (process.env.FUNCTIONS_CONFIG as any).newsapi.key
      : undefined);

  if (!NEWS_API_KEY) {
    console.error("Missing NEWS_API_KEY in environment config");
    return [];
  }

  const keyword = "migrant workers Singapore";
  const res = await fetch(
    `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      keyword
    )}&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
  );
  const data = await res.json();

  if (!data.articles || !Array.isArray(data.articles)) {
    console.error("Invalid response from NewsAPI:", data);
    return [];
  }

  return data.articles;
}

export const fetchNewsNow = onRequest(async (req, res) => {
  try {
    const articles = await fetchNewsArticles();
    if (!articles.length) {
      res.status(500).send("Failed to fetch articles.");
      return;
    }

    await saveArticles(articles);
    res.status(200).send(`Fetched and saved ${articles.length} articles.`);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).send("Internal Server Error");
  }
});
