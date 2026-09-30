import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions/v2";
import { logger } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";

initializeApp();

// Keep the functions next to the Firestore database (eur3) and cap scaling
// so a traffic spike can't run up the bill.
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

const TEXTS_COLLECTION = "texts";

interface TextDto {
  id: string;
  text: string;
  order: number;
}

/**
 * GET /texts
 *
 * Returns every document in the `texts` collection, sorted by `order`:
 * { "texts": [{ "id": "...", "text": "...", "order": 1 }, ...] }
 */
export const texts = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    res.set("Allow", "GET").status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const snapshot = await getFirestore()
      .collection(TEXTS_COLLECTION)
      .orderBy("order")
      .get();

    const items: TextDto[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      text: doc.get("text"),
      order: doc.get("order"),
    }));

    res.set("Cache-Control", "public, max-age=60").json({ texts: items });
  } catch (error) {
    logger.error("Failed to load texts", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
