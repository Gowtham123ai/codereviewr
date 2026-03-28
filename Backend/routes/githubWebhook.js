const express = require("express");
const router = express.Router();

const { reviewWebhookEvent } = require("../src/services/webhook.service");

router.post("/", async (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log(`[GitHub Webhook] Received Event: ${event}`);

  // Handle common GitHub events
  if (event === "push") {
    const aiReview = await reviewWebhookEvent(payload, "push");
    console.log(`[Webhook AI Review] ${aiReview.event_review}`);
    console.log(`[Webhook AI Score] ${aiReview.score}/100`);
    if (aiReview.suggestions?.length > 0) {
      console.log(`[Webhook AI Suggestions] ${aiReview.suggestions.join(", ")}`);
    }
  } else if (event === "pull_request") {
    const aiReview = await reviewWebhookEvent(payload, "pull_request");
    console.log(`[Webhook AI Review] ${aiReview.event_review}`);
    console.log(`[Webhook AI Score] ${aiReview.score}/100`);
  } else if (event === "ping") {
    console.log("GitHub Webhook Connection Verified (Ping Event).");
  } else {
    console.log(`Unhandled Event Type: ${event}`);
  }

  res.status(200).json({
    status: "Webhook received and AI analysis complete",
    event: event,
    repository: payload.repository?.full_name
  });
});

module.exports = router;
