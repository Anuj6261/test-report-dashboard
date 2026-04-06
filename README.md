# Test Report Dashboard

A professional, full-stack web application designed for browsing, previewing, and downloading test reports and automation pipeline artifacts. 

---

## 1. Key Features

- **Dynamic File System Explorer:** Navigate deeply nested server directories seamlessly without full-page reloads.
- **O(1) Memory Streaming:** Download entire massive directories as `.zip` payloads generated on the fly using `archiver`. No temporary files are ever written to the disk, preserving server disk I/O and RAM.
- **Bulletproof Security:** Implements a mathematical Traversal Path lock (`startsWith` checking with path separators) to prevent malicious hackers from breaking out of the designated data folder.
- **Interactive Documentation:** Integrated Swagger UI self-documents the API endpoints directly from the source code.
- **Blazing Fast Architecture:** The frontend uses Vite/esbuild for instant Hot Module Replacement (HMR) and Nginx reverse proxying for lightning-fast localized static asset delivery.

---

## 2. Project Architecture & Design Rationale

The architecture of this application strictly prioritizes maintainability, security, and performance.

### Architectural Choices
- **React + Vite (Frontend):** Selected for its blazing-fast compilation during development and highly optimized Rollup bundling for production. State is centrally managed via custom hooks and React Context to handle deep folder navigation without redundant re-renders.
- **Node.js + Express (Backend):** Selected for its non-blocking asynchronous I/O model. It heavily leans on rapid data streams to transport large nested pipeline artifacts concurrently over HTTP.
- **Controller-Service Pattern:** The backend strictly separates HTTP parsing (Controllers) from pure JavaScript business logic (Services/File System logic). This creates extremely isolated, testable inner code logic without needing a mocked Express server.
- **Nginx Reverse Proxy:** In production (Docker), Nginx serves the static React assets and proxies `/api/*` traffic to the Node backend. This completely solves CORS issues, encrypts pathways natively, and handles static file deliveries efficiently.

---

## 3. Security Implementations

Security is woven into every layer of this application to make it enterprise-ready:

1. **Zero-Trust CORS:** The `cors` implementation completely falls back to `origin: undefined` if no environment variable is provided, defaulting to a zero-trust model that blocks external traffic until explicitly whitelisted in `.env`.
2. **Path Traversal Protection:** Implemented a robust `safePath` algorithm using `path.resolve` and strict trajectory-separator matching. It guarantees clients cannot leverage `../etc/passwd` directory-escalation payloads.
3. **DDoS Resiliency:** The Express cluster integrates `express-rate-limit` to thwart automated bot scrapers and brute-forcing vectors (Limited to 200 req per 15 mins).
4. **V8 Engine Payload Protection:** Browsers and V8 engine heaps crash if asked to open 2GB log files into memory. The backend `getFileContentString` securely restricts raw file previews to `MAX_FILE_SIZE` (default 5MB), tossing an HTTP 413 Payload Too Large if exceeded.

---

## 4. Setup Instructions

The application can be run seamlessly via Docker (recommended) or locally using Node.js.

### Prerequisites
- **Node.js** (v20 or higher)
- **Docker & Docker Compose** (Optional, for containerized production deployment)

### Environment Variables
Create `.env` files in their respective directories:

**Backend (`/backend/.env`)**
```env
PORT=4000
# Leave CORS_ORIGIN blank to restrict all Origins except localhost
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200
```

**Frontend (`/frontend/.env`)**
```env
VITE_API_URL=http://localhost:4000
VITE_API_TIMEOUT_MS=30000
VITE_API_MAX_RETRIES=3
VITE_API_RETRY_DELAY_MS=1000
```

###   Running via Docker
To build and start the entire stack natively with Nginx proxying and automatic isolated networking using Docker Desktop:
```bash
docker compose up --build -d
```
*The dashboard will effortlessly map and connect to `http://localhost/`.*

#### Running Pre-built Images from Docker Hub
If you want to run the pre-built images directly from Docker Hub without building the code locally, you can pull and run them individually:

**Backend API:**
```bash
docker run -d -p 4000:4000 --name dashboard-backend anuj6261/test-report-dashboard-backend:latest
```

**Frontend React UI:**
```bash
docker run -d -p 80:80 --name dashboard-frontend anuj6261/test-report-dashboard-frontend:latest
```

### Running Locally (Development)
1. **Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   *The backend runs on port `4000`. On first start, it automatically seeds mock report data.*

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *The dashboard UI is mapped directly to `http://localhost:5173`.*

---

##  5. API Documentation

The backend provides a complete, interactive OpenAPI 3.0 (Swagger) specification.

Once the backend is running, navigate to the visual explorer:
👉 **[http://localhost:4000/api-docs](http://localhost:4000/api-docs)**

### Available Endpoints
- **`GET /api/list`**: Lists files and folders for a given target path. Includes absolute metadata (size in bytes, mod-date ISO) and handles alphabetical sorting with directories explicitly floating to the top.
- **`GET /api/file`**: Retrieves the raw text payload of a log/report file (enforces payload limit protection to prevent server memory crashes).
- **`GET /api/download`**: Streams an individual file as a binary octet-stream download, or dynamically pipes `archiver` outputs to Zip and download entire nested server folders.
- **`GET /api/health`**: Provides a basic 200 OK timestamp response connected to load-balancer container probes.

All endpoints support the `?path=` query parameter (e.g. `?path=/automation_logs/ci_results.txt`). Use the Swagger UI's visual "Try it out" feature to debug server trajectories.

---

## 6. AI Usage Policy

This project was developed with the assistance of powerful LLM AI tools to accelerate robust scaffolding and ensure industry-standard best practices.

**How AI was selectively leveraged:**
- **Boilerplate Scaffolding:** Initial CI generation for the multi-stage Dockerfiles and Nginx `.conf` pipeline routing.
- **API Documentation:** Rapid OpenAPI 3.0 JSDoc schema translations for the visual Swagger UI implementation.
- **CSS Layouts:** Generating accessible CSS Grid and Flexbox UI templates for the responsive component viewers.
- **Security Auditing:** AI acted comprehensively as a cyber-security auditor to test the initial backend architecture, successfully identifying and refactoring a silent path-traversal vulnerability in JavaScript's `startsWith()` methodology.

**Validation & Vetting:**
All AI-generated code, architecture suggestions, and container networking configurations were meticulously reviewed, tested across Windows/Linux runtimes, and vetted to ensure strict adherence to secure coding principles. No unfiltered or unverified AI output persists in the `main` architecture layer.
