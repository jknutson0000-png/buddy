const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "dist");
const items = [
  "index.html",
  "styles.css",
  "app.js",
  "manifest.webmanifest",
  "service-worker.js",
  "assets"
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const item of items) {
  const source = path.join(root, item);
  const target = path.join(outDir, item);
  fs.cpSync(source, target, { recursive: true });
}

console.log("Built static app in dist");
