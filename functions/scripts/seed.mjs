// Writes scripts/texts.json into the `texts` Firestore collection.
// Existing documents with the same id are overwritten.
//
// Against the emulator:   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run seed
// Against production:     GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json npm run seed
import { readFile } from "node:fs/promises";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const texts = JSON.parse(await readFile(new URL("./texts.json", import.meta.url), "utf8"));

initializeApp({ projectId: "i-we-gain" });
const db = getFirestore();

const batch = db.batch();
for (const { id, text, order } of texts) {
  batch.set(db.collection("texts").doc(id), { text, order, updatedAt: FieldValue.serverTimestamp() });
}
await batch.commit();

console.log(`Seeded ${texts.length} texts`);
