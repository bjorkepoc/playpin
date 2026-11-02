const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const {
  DEFAULT_SETTINGS,
  normalizeSpeed,
  normalizeSettings,
  pickBestQuality,
} = require("../src/shared.js");

test("normalizes playback speed to YouTube-safe values", () => {
  assert.equal(normalizeSpeed("1.5"), 1.5);
  assert.equal(normalizeSpeed("0.1"), 0.25);
  assert.equal(normalizeSpeed("20"), 16);
  assert.equal(normalizeSpeed("nope"), DEFAULT_SETTINGS.speed);
});

test("normalizes stored settings with defaults", () => {
  assert.deepEqual(normalizeSettings({ speed: "1.75", maxQuality: false }), {
    speed: 1.75,
    maxQuality: false,
  });
  assert.deepEqual(normalizeSettings({}), DEFAULT_SETTINGS);
});

test("picks the highest non-auto YouTube quality", () => {
  assert.equal(pickBestQuality(["auto", "hd720", "hd1080"]), "hd1080");
  assert.equal(pickBestQuality(["medium", "tiny", "hd2160"]), "hd2160");
  assert.equal(pickBestQuality(["auto"]), null);
  assert.equal(pickBestQuality([]), null);
});

test("manifest references files that exist", () => {
  const root = path.resolve(__dirname, "..");
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.name, "PlayPin");
  assert.equal(fs.existsSync(path.join(root, manifest.action.default_popup)), true);

  for (const script of manifest.content_scripts[0].js) {
    assert.equal(fs.existsSync(path.join(root, script)), true, script);
  }

  for (const resource of manifest.web_accessible_resources[0].resources) {
    assert.equal(fs.existsSync(path.join(root, resource)), true, resource);
  }

  for (const icon of Object.values(manifest.icons)) {
    assert.equal(fs.existsSync(path.join(root, icon)), true, icon);
  }
});

test("launch collateral exists", () => {
  const root = path.resolve(__dirname, "..");
  const requiredFiles = [
    "assets/playpin-icon.svg",
    "site/index.html",
    "site/privacy.html",
    "store-listing.md",
    "scripts/build-icons.js",
    "scripts/package-extension.js",
  ];

  for (const file of requiredFiles) {
    assert.equal(fs.existsSync(path.join(root, file)), true, file);
  }

  const listing = fs.readFileSync(path.join(root, "store-listing.md"), "utf8");
  assert.match(listing, /Single purpose/i);
  assert.match(listing, /storage/i);
  assert.match(listing, /No tracking/i);
});

test("YouTube overrides are applied once per video start", () => {
  const root = path.resolve(__dirname, "..");
  const content = fs.readFileSync(path.join(root, "src/content.js"), "utf8");
  const page = fs.readFileSync(path.join(root, "src/page.js"), "utf8");

  assert.doesNotMatch(content, /ratechange/);
  assert.match(content, /lastAppliedVideoKey/);
  assert.match(content, /yt-navigate-finish/);
  assert.doesNotMatch(page, /setInterval/);
});

test("max quality uses the player call that YouTube still honors", () => {
  const root = path.resolve(__dirname, "..");
  const page = fs.readFileSync(path.join(root, "src/page.js"), "utf8");

  assert.match(page, /setPlaybackQualityRange/);
  assert.doesNotMatch(page, /"setPlaybackQuality"/);
});

test("settings skip ads and are applied again when an ad ends", () => {
  const root = path.resolve(__dirname, "..");
  const content = fs.readFileSync(path.join(root, "src/content.js"), "utf8");

  assert.match(content, /\.ad-showing/);
  assert.match(content, /adWasShowing && !adShowing/);
});
