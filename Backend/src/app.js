const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/ai.routes');
const rewriteRoutes = require('./routes/rewrite.routes');
const toolRoutes = require('./routes/tool.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROOT LOG: Confirming server start
console.log("[App] Backend Initializing...");

app.get("/", (req, res) => {
    res.send("Code Reviewer AI Backend is Running");
});

// MOUNTING GLOBALLY: This ensures all routes work regardless of prefix stripping by Vercel
app.use(aiRoutes);
app.use(rewriteRoutes);
app.use(toolRoutes);

// RE-MOUNTING with prefixes for local development compatibility
app.use('/ai', aiRoutes);
app.use('/api', rewriteRoutes);
app.use('/api/tools', toolRoutes);

module.exports = app;