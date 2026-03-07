const axios = require('axios');
require('dotenv').config();

async function checkApi() {
    const key = process.env.GOOGLE_GEMINI_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await axios.get(url);
        console.log("Models found:", response.data.models.map(m => m.name));
    } catch (error) {
        console.error("Error fetching models:", error.response ? error.response.status : error.message);
        if (error.response) {
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

checkApi();
