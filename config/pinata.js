import axios from 'axios'

export const pinJSONToIPFS = async (jsonData) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`

  const res = await axios.post(url, jsonData, {
    headers: {
      'Content-Type': 'application/json',
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_SECRET
    }
  })

  return res.data.IpfsHash // CID
}
