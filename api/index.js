const app = require('../Backend/src/app');

// Vercel expects an exported function as a handler
module.exports = (req, res) => {
  return app(req, res);
};
