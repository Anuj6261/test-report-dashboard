const fs = require("fs/promises");
const path = require("path");

const DATA_ROOT = path.join(__dirname, "data");


// Fake test log content generators
const generatePassLog = (testName, duration) => `
[${new Date().toISOString()}] TEST SUITE: ${testName}
================================================================
Environment  : CI/CD Pipeline
Node Version : v18.17.0
Runner       : GitHub Actions / ubuntu-latest
================================================================

RUNNING TESTS...

  ✓ should initialize component correctly (${Math.floor(Math.random() * 50 + 10)}ms)
  ✓ should handle valid input (${Math.floor(Math.random() * 30 + 5)}ms)
  ✓ should reject invalid parameters (${Math.floor(Math.random() * 20 + 5)}ms)
  ✓ should return correct response format (${Math.floor(Math.random() * 40 + 10)}ms)
  ✓ should handle edge cases gracefully (${Math.floor(Math.random() * 60 + 20)}ms)
  ✓ should process concurrent requests (${Math.floor(Math.random() * 100 + 50)}ms)
  ✓ should clean up resources on exit (${Math.floor(Math.random() * 25 + 5)}ms)

TEST RESULTS
----------------------------------------------------------------
  Test Suites : 1 passed, 1 total
  Tests       : 7 passed, 7 total
  Snapshots   : 0 total
  Time        : ${duration}s
  Status      : PASSED ✓

Coverage Summary:
  Statements  : 94.2% (161/171)
  Branches    : 88.5% (46/52)
  Functions   : 100% (23/23)
  Lines       : 93.8% (150/160)
`;

const generateFailLog = (testName, duration) => `
[${new Date().toISOString()}] TEST SUITE: ${testName}
================================================================
Environment  : CI/CD Pipeline
Node Version : v18.17.0
Runner       : GitHub Actions / ubuntu-latest
================================================================

RUNNING TESTS...

  ✓ should initialize service correctly (${Math.floor(Math.random() * 50 + 10)}ms)
  ✓ should connect to database (${Math.floor(Math.random() * 30 + 5)}ms)
  ✗ should handle timeout gracefully (${Math.floor(Math.random() * 200 + 100)}ms)

    ● Error: Expected response within 5000ms, received timeout after 8231ms
      at Object.<anonymous> (tests/integration.test.js:47:12)
      at Promise.resolve.then (node_modules/jest-jasmine2/build/index.js:312:24)

  ✗ should retry on transient failures (${Math.floor(Math.random() * 150 + 80)}ms)

    ● AssertionError: expected 3 retries, got 1
      at retryHandler (src/services/retry.js:23:8)

  ✓ should log errors correctly (${Math.floor(Math.random() * 20 + 5)}ms)
  ✓ should rollback transaction on error (${Math.floor(Math.random() * 40 + 10)}ms)

TEST RESULTS
----------------------------------------------------------------
  Test Suites : 1 failed, 1 total
  Tests       : 2 failed, 4 passed, 6 total
  Snapshots   : 0 total
  Time        : ${duration}s
  Status      : FAILED ✗

FAILURE SUMMARY:
  1. Timeout handling broken — service not respecting configured timeout limit
  2. Retry logic regression — introduced in commit a3f9c12
`;

const generatePerfLog = () => `
[${new Date().toISOString()}] PERFORMANCE BENCHMARK REPORT
================================================================
Environment  : Staging (4 vCPU, 8GB RAM)
Tool         : k6 Load Testing
================================================================

SCENARIO: Ramp-up load test (0 → 500 VUs over 5 minutes)

  ✓ http_req_duration............: avg=142ms  min=23ms   med=98ms   max=4201ms p(90)=287ms p(95)=512ms
  ✓ http_req_failed..............: 0.23%  (12/5234 requests failed)
  ✓ http_reqs....................: 5234   (17.4/s)
  ✓ vus_max......................: 500
  ✓ iteration_duration...........: avg=1.14s  min=0.82s  med=1.01s  max=6.23s

ENDPOINT BREAKDOWN:
  GET  /api/list       avg=45ms   p(95)=120ms   ✓
  GET  /api/file       avg=89ms   p(95)=230ms   ✓
  GET  /api/download   avg=312ms  p(95)=890ms   ✓

CONCLUSION: System handles 500 concurrent users within SLA thresholds.
`;

const generateSummaryJson = (jobId, status, passed, failed, total) =>
  JSON.stringify(
    {
      jobId,
      timestamp: new Date().toISOString(),
      status,
      pipeline: "main",
      commit: `${Math.random().toString(36).substring(2, 9)}`,
      branch: "main",
      results: { passed, failed, total, skipped: 0 },
      duration: `${(Math.random() * 3 + 0.5).toFixed(2)}m`,
      artifacts: [
        "unit_test.log",
        "integration_test.log",
        "coverage_report.html",
      ],
    },
    null,
    2
  );

const generateCoverageHtml = (jobId) => `<!DOCTYPE html>
<html>
<head>
  <title>Coverage Report - Job ${jobId}</title>
  <style>
    body { font-family: monospace; background: #1a1a2e; color: #eee; padding: 24px; }
    h1 { color: #00d4aa; }
    table { border-collapse: collapse; width: 100%; }
    th { background: #16213e; color: #00d4aa; padding: 8px 12px; text-align: left; }
    td { padding: 8px 12px; border-bottom: 1px solid #333; }
    .high { color: #00d4aa; } .med { color: #ffd700; } .low { color: #ff6b6b; }
  </style>
</head>
<body>
  <h1>Coverage Report — Job ${jobId}</h1>
  <p>Generated: ${new Date().toISOString()}</p>
  <table>
    <tr><th>File</th><th>Statements</th><th>Branches</th><th>Functions</th><th>Lines</th></tr>
    <tr><td>src/api/routes.js</td><td class="high">97.2%</td><td class="high">91.3%</td><td class="high">100%</td><td class="high">96.8%</td></tr>
    <tr><td>src/services/fileService.js</td><td class="high">94.5%</td><td class="med">78.6%</td><td class="high">100%</td><td class="high">93.2%</td></tr>
    <tr><td>src/middleware/auth.js</td><td class="med">82.1%</td><td class="med">75.0%</td><td class="high">88.9%</td><td class="med">81.5%</td></tr>
    <tr><td>src/utils/helpers.js</td><td class="low">61.3%</td><td class="low">52.4%</td><td class="med">70.0%</td><td class="low">60.8%</td></tr>
  </table>
  <p><strong>Overall: 83.8% statements covered</strong></p>
</body>
</html>`;

async function seedData() {
  try {
    const contents = await fs.readdir(DATA_ROOT);
    if (contents.length > 0) {
      console.log("[seed] /data already contains files, skipping seed.");
      return;
    }
  } catch (err) {
    // Doesn't exist or isn't a directory, proceed
  }

  console.log("[seed] Creating fabricated test pipeline data...");

  const jobs = [
    { id: "job_12345", status: "passed", passed: 47, failed: 0, total: 47 },
    { id: "job_12346", status: "failed", passed: 31, failed: 2, total: 33 },
    { id: "job_12347", status: "passed", passed: 52, failed: 0, total: 52 },
  ];

  for (const job of jobs) {
    const jobDir = path.join(DATA_ROOT, "test_pipeline_results", job.id);
    await fs.mkdir(jobDir, { recursive: true });

    // Unit test log
    await fs.writeFile(
      path.join(jobDir, "unit_test.log"),
      generatePassLog("Unit Tests — Core Module", (Math.random() * 5 + 1).toFixed(2))
    );

    // Integration test log
    await fs.writeFile(
      path.join(jobDir, "integration_test.log"),
      job.status === "failed"
        ? generateFailLog("Integration Tests — API Layer", (Math.random() * 8 + 3).toFixed(2))
        : generatePassLog("Integration Tests — API Layer", (Math.random() * 8 + 3).toFixed(2))
    );

    // Summary JSON
    await fs.writeFile(
      path.join(jobDir, "summary.json"),
      generateSummaryJson(job.id, job.status, job.passed, job.failed, job.total)
    );

    // Coverage HTML
    await fs.writeFile(
      path.join(jobDir, "coverage_report.html"),
      generateCoverageHtml(job.id)
    );

    // Nested logs subfolder
    const logsDir = path.join(jobDir, "detailed_logs");
    await fs.mkdir(logsDir, { recursive: true });
    await fs.writeFile(path.join(logsDir, "build.log"), `[BUILD] Compiling source files...\n[BUILD] Running linter... OK\n[BUILD] Transpiling TypeScript... OK\n[BUILD] Bundle size: 284KB\n[BUILD] Build completed in 12.4s ✓\n`);
    await fs.writeFile(path.join(logsDir, "deploy.log"), `[DEPLOY] Pushing image to registry...\n[DEPLOY] Image: test-app:${job.id}\n[DEPLOY] Deploying to staging environment...\n[DEPLOY] Health check passed ✓\n[DEPLOY] Deployment completed\n`);
  }

  // Performance results (separate top-level folder)
  const perfDir = path.join(DATA_ROOT, "performance_results", "run_20240315");
  await fs.mkdir(perfDir, { recursive: true });
  await fs.writeFile(path.join(perfDir, "load_test.log"), generatePerfLog());
  await fs.writeFile(
    path.join(perfDir, "summary.json"),
    JSON.stringify({ run: "run_20240315", tool: "k6", vus: 500, duration: "5m", passed: true }, null, 2)
  );

  console.log("[seed] Done. Fabricated data created at /data");
}

module.exports = { seedData, DATA_ROOT };
