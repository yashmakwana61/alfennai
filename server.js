// Entry point for Hostinger's Passenger-based Node.js hosting.
//
// Passenger assigns a port dynamically via process.env.PORT and expects the
// app to listen on exactly that port. Plain `next start` ignores PORT and
// always binds to 3000, so Passenger's proxy can never reach it -- which is
// what was causing the 503 "Service Unavailable" page. This wrapper fixes
// that by explicitly listening on process.env.PORT.
//
// In hPanel: Advanced > Node.js > your app > "Startup file" must be set to
// server.js (not app.js, not next start directly).

const { createServer } = require("http");
const next = require("next");

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const port = process.env.PORT || 3000;
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`AlfennAI server listening on port ${port}`);
  });
});
