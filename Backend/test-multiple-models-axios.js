const axios = require('axios');
require('dotenv').config();

async function testMultipleModels() {
    const key = process.env.GOOGLE_GEMINI_KEY;
    const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];

    for (const model of models) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const data = {
            contents: [{
                parts: [{ text: "Hello" }]
            }]
        };

        try {
            console.log(`Testing ${model}...`);
            const response = await axios.post(url, data, { timeout: 10000 });
            console.log(`✅ ${model} worked!`);
            return;
        } catch (error) {
            console.log(`❌ ${model} failed: ${error.response ? error.response.status : error.message}`);
        }
    }
}

testMultipleModels();
