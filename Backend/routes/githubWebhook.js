const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log("GitHub Event:", event);

  if (event === "push") {
    console.log("Push event detected");
    console.log("Repository:", payload.repository.full_name);
    console.log("Commit message:", payload.head_commit.message);
  }

  res.status(200).send("Webhook received");
});

module.exports = router;
