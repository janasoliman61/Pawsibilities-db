const axios = require('axios');
const fs = require('fs');
const tmp = require('tmp');
const FormData = require('form-data');

/**
 * Downloads an image from a URL and sends it to Flask API for breed detection.
 * @param {string} imageUrl - Public Firebase Storage image URL
 * @returns {Promise<{ breed: string, confidence: number }>}
 */
async function detectBreed(imageUrl) {
  const tmpFile = tmp.fileSync({ postfix: '.jpg' }); // prepare temp file

  try {
    // Step 1: Download image as buffer
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    // Step 2: Check content type
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.startsWith('image')) {
      throw new Error("Downloaded content is not an image");
    }

    // Step 3: Write image to temporary file
    fs.writeFileSync(tmpFile.name, response.data);
    console.log("✅ Image written to:", tmpFile.name);

    // Step 4: Prepare form data
    const form = new FormData();
    form.append('file', fs.createReadStream(tmpFile.name));

    // Step 5: Send to Flask model API
    const result = await axios.post('http://127.0.0.1:5003/predict', form, {
      headers: form.getHeaders(),
    });

    // Step 6: Return response from model
    return result.data;

  } catch (err) {
    // Log full error response from Flask for debugging
    if (err.response) {
      console.error("❌ Error during breed detection:");
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error("❌ Unexpected error:", err.message);
    }
    throw new Error("Breed prediction failed");

  } finally {
    // Always delete temp file
    tmpFile.removeCallback();
  }
}


module.exports = detectBreed;
