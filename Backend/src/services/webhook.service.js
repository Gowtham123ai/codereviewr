const { probeAI } = require("./ai.utils");

// Version: 1.2.0-PROBE - Webhook AI with Probing
const systemInstruction = `
You are an Automated GitHub Assistant. Your job is to analyze incoming Webhook events (like Pushes and Pull Requests) and provide a professional, helpful review of the activity.

When reviewing a **Push event**, you should:
1. Analyze the commit message(s) for clarity, adherence to "Conventional Commits" standards, and technical description.
2. Provide a score (0-100) for the commit quality.
3. Offer suggestions if the commit message is vague (e.g., "fixed bug" is bad, "fixed null pointer exception in user auth" is good).

When reviewing a **Pull Request**, you should:
1. Analyze the PR title and description.
2. Summarize the importance of the changes based on the description.

Return your response in JSON format:
{
  "event_review": "the markdown summary and review",
  "score": 85,
  "suggestions": ["list of improvement points"]
}
Return ONLY the JSON. No markdown wrappers.
`;

async function reviewWebhookEvent(payload, eventType) {
    let prompt = "";
    
    if (eventType === "push") {
        const commit = payload.head_commit;
        if (!commit) return { event_review: "No commit found.", score: 100, suggestions: [] };
        
        prompt = `Review this GitHub Push:
        Repository: ${payload.repository.full_name}
        Pushed by: ${payload.pusher.name}
        Latest Commit: "${commit.message}"
        Modified Files: ${commit.modified ? commit.modified.join(", ") : "None"}
        `;
    } else if (eventType === "pull_request") {
        const pr = payload.pull_request;
        prompt = `Review this GitHub Pull Request:
        Action: ${payload.action}
        Title: ${pr.title}
        Description: ${pr.body}
        Sender: ${payload.sender.login}
        `;
    } else {
        return { event_review: "Event type not explicitly handled for AI review.", score: 100, suggestions: [] };
    }

    try {
        const parsed = await probeAI(prompt, systemInstruction);
        
        return {
            event_review: parsed.event_review || parsed.raw || "WebHook processed successfully.",
            score: parseInt(parsed.score) || 0,
            suggestions: parsed.suggestions || []
        };
    } catch (error) {
        console.error("AI Webhook Review Error:", error);
        return {
            event_review: "AI was unable to process this event at this time.",
            score: 0,
            suggestions: [error.message]
        };
    }
}

module.exports = { reviewWebhookEvent };
