const axios = require('axios');
require('dotenv').config();

async function testAxiosAI() {
    const key = process.env.GOOGLE_GEMINI_KEY;
    const model = "gemini-flash-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const data = {
        contents: [{
            parts: [{ text: "Hello, are you working?" }]
        }],
        system_instruction: {
            parts: [{ text: "You are a helpful assistant." }]
        }
    };

    try {
        console.log("Sending request via Axios...");
        const response = await axios.post(url, data);
        console.log("Response:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Axios AI Error:", error.response ? error.response.status : error.message);
        if (error.response) {
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

testAxiosAI();
