import axios from 'axios';
import FormData from 'form-data';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

export const uploadJSONToIPFS = async (jsonData) => {
  try {
    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      jsonData,
      {
        headers: {
          'Content-Type': 'application/json',
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
      }
    );
    return res.data.IpfsHash;
  } catch (err) {
    console.error('Pinata IPFS Upload Failed:', err.message);
    throw err;
  }
};
