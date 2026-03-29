const generateRewrite = require('../Backend/src/services/rewrite.service');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

    const result = await generateRewrite(code);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('[Vercel Rewrite Error] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
