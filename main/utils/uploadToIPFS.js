const axios = require('axios');
const FormData = require('form-data');

module.exports = async (buffer) => {
  const form = new FormData();
  form.append('file', buffer);

  const res = await axios.post('https://ipfs.infura.io:5001/api/v0/add', form, {
    headers: {
      ...form.getHeaders(),
      Authorization: 'Basic ' + Buffer.from(
        process.env.INFURA_PROJECT_ID + ':' + process.env.INFURA_SECRET
      ).toString('base64')
    }
  });

  return res.data.Hash;
};
