const axios = require('axios');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const FormData = require('form-data');

/**
 * Downloads an image from a URL and sends it to Flask API for breed detection.
 * @param {string} imageUrl - Public Firebase Storage image URL
 * @returns {Promise<{ breed: string, confidence: number }>}
 */
async function detectBreed(imageUrl) {
  try {
    // === Step 1: Create a temporary file ===
    const tmpFile = tmp.fileSync({ postfix: '.jpg' }); // creates /tmp/random.jpg

    // === Step 2: Download image to the temp file ===
    const writer = fs.createWriteStream(tmpFile.name);
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream'
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // === Step 3: Prepare image and send to Flask ===
    const form = new FormData();
    form.append('file', fs.createReadStream(tmpFile.name));

    const result = await axios.post('http://localhost:5000/predict', form, {
      headers: form.getHeaders(),
    });

    // === Step 4: Clean up temp file and return result ===
    tmpFile.removeCallback();
    return result.data;

  } catch (err) {
    console.error("❌ Error during breed detection:", err.response?.data || err.message);
    throw new Error("Breed prediction failed");
  }
}

module.exports = detectBreed;