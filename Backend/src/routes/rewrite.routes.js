const express = require('express');
const rewriteController = require("../controllers/rewrite.controller");

const router = express.Router();

router.post("/rewrite", rewriteController.rewriteCode);

module.exports = router;
