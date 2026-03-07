const express = require('express');
const toolController = require("../controllers/tool.controller");

const router = express.Router();

router.post("/explain", toolController.explainCode);
router.post("/detect-bugs", toolController.detectBugs);

module.exports = router;
