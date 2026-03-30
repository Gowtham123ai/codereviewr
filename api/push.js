const { reviewWebhookEvent } = require("../Backend/src/services/webhook.service");

module.exports = async (req, res) => {
  // CORS check
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-github-event');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log(`[Vercel Webhook] Received Event: ${event}`);

    let aiReview = { event_review: "Event received", score: 100, suggestions: [] };

    // Use the actual AI logic
    if (event === "push") {
      aiReview = await reviewWebhookEvent(payload, "push");
    } else if (event === "pull_request") {
      aiReview = await reviewWebhookEvent(payload, "pull_request");
    }

    res.status(200).json({ 
      success: true, 
      message: "Webhook processed", 
      event, 
      review: aiReview 
    });
  } catch (error) {
    console.error("[Vercel Webhook Error]:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
