const helmet = require("helmet");

// Pre-configured helmet middleware for setting secure HTTP headers
const securityHeaders = helmet();

module.exports = securityHeaders;
