const { Web3Storage, File } = require("web3.storage");

const client = new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });

async function uploadJSON(jsonData, filename = "complaint.json") {
  const blob = new Blob([JSON.stringify(jsonData)], { type: "application/json" });
  const file = new File([blob], filename);
  const cid = await client.put([file]);
  return cid;
}

module.exports = { uploadJSON };
