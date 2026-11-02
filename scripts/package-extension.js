const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
const version = manifest.version;
const distDir = path.join(root, "dist");
const zipName = `playpin-${version}.zip`;
const zipPath = path.join(distDir, zipName);

const files = [
  "manifest.json",
  "assets/icon-16.png",
  "assets/icon-32.png",
  "assets/icon-48.png",
  "assets/icon-128.png",
  "assets/playpin-icon.svg",
  "src/content.js",
  "src/page.js",
  "src/popup.html",
  "src/popup.js",
  "src/shared.js",
];

for (const file of files) {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing package file: ${file}`);
  }
}

fs.mkdirSync(distDir, { recursive: true });
fs.rmSync(zipPath, { force: true });

const result = spawnSync("zip", ["-X", "-q", zipPath, ...files], {
  cwd: root,
  stdio: "inherit",
});

if (result.status !== 0) {
  throw new Error("zip command failed");
}

console.log(zipPath);
