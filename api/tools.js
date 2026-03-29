const generateAnalysis = require('../Backend/src/services/tool.service');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  try {
    const { code } = req.body;
    // Get tool type from the URL via a header or param, but for simplicity we rely on the body or source
    const type = req.url.includes('detect-bugs') ? 'detect-bugs' : 'explain';
    
    if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

    const analysis = await generateAnalysis(code, type);
    
    if (type === 'explain') {
        res.status(200).json({ success: true, explanation: analysis });
    } else {
        res.status(200).json({ success: true, bugs: analysis });
    }
  } catch (error) {
    console.error('[Vercel Tool Error] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
