import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";
import { readFileSync } from "fs";

const init = () => {
  if (getApps().length) return;

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  const databaseURL = process.env.DATABASE_URL;

  if (!serviceAccount || !databaseURL) {
    console.error(
      "Missing FIREBASE_SERVICE_ACCOUNT or DATABASE_URL environment variable"
    );
    return;
  }

  // Support both JSON string and file path
  let credential;
  try {
    if (serviceAccount.trim().startsWith("{")) {
      credential = JSON.parse(serviceAccount);
    } else {
      credential = JSON.parse(readFileSync(serviceAccount, "utf-8"));
    }
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", err);
    return;
  }

  initializeApp({
    credential: cert(credential),
    databaseURL,
  });
};

init();

export const db = (() => {
  try {
    return getDatabase();
  } catch {
    return null;
  }
})() as Database;
