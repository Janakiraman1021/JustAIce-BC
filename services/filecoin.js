import { Web3Storage, File } from "web3.storage";
import fs from "fs";
import path from "path";

const client = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });

// Ensure uploads folder exists for local fallback
const UPLOADS_DIR = path.join(process.cwd(), "backend", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export async function uploadJSON(jsonData, filename = "complaint.json") {
  try {
    const blob = new Blob([JSON.stringify(jsonData)], { type: "application/json" });
    const file = new File([blob], filename);
    const cid = await client.put([file]);
    return cid;
  } catch (err) {
    // Web3.storage failed (maintenance / network). Fallback to local storage.
    console.error("web3.storage upload failed, falling back to local file storage:", err.message);
    const ts = Date.now();
    const localName = `${ts}-${filename}`;
    const localPath = path.join(UPLOADS_DIR, localName);
    try {
      fs.writeFileSync(localPath, JSON.stringify(jsonData, null, 2), "utf8");
      // Return a marker that indicates local storage was used. Caller can detect and handle it.
      return `LOCAL::${localName}`;
    } catch (fsErr) {
      console.error("Failed to write local fallback file:", fsErr.message);
      throw err; // rethrow original web3.storage error
    }
  }
}
