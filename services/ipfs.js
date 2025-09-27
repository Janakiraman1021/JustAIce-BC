 
import ipfsClient from '../config/ipfs.js';

export const uploadToIPFS = async (fileBuffer) => {
  const result = await ipfsClient.add(fileBuffer);
  return result.path;
};
