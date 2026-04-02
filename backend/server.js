require("dotenv").config();
const express = require("express");
const cors = require("cors");
const securityHeaders = require("./middlewares/security");
const apiLimiter = require("./middlewares/rateLimiter");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { seedData, DATA_ROOT } = require("./seed");
const apiRoutes = require("./routes/apiRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middleware 
app.use(securityHeaders);     // Sets secure HTTP headers
app.use(cors({ origin: process.env.CORS_ORIGIN }));
// Rate limiting — prevents abuse
app.use("/api/", apiLimiter);

// Body parser
app.use(express.json());

// Routes 
app.use("/api", apiRoutes);

// Swagger Documentation Setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Test Report Dashboard API",
      version: "1.0.0",
      description: "API for reading and downloading test reports",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  // Look for Swagger comments in these files
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler 
app.use((req, res) => {
  res.status(404).json({ error: "The requested API endpoint does not exist." });
});

// Global error handler 
app.use((err, req, res, next) => {
  console.error("[error]", err);
  res.status(500).json({ error: "An unexpected server error occurred. Please try again later." });
});

// Bootstrap async server
const startServer = async () => {
  try {
    await seedData();
    app.listen(PORT, () => {
      console.log(`[server] Test Report Dashboard backend running on port ${PORT}`);
      console.log(`[server] Data root: ${DATA_ROOT}`);
    });
  } catch (err) {
    console.error("[server] Critical boot failure:", err);
    process.exit(1);
  }
}

startServer();
