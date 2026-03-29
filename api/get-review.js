const aiService = require('../Backend/src/services/ai.service');

module.exports = async (req, res) => {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

    const reviewData = await aiService(code);
    res.status(200).json({ success: true, ...reviewData });
  } catch (error) {
    console.error('[Vercel Review] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
