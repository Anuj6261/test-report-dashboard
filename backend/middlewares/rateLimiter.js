const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "200", 10),
  message: { error: "Too many requests, please try again later." },
});

module.exports = apiLimiter;
