(function attachShared(root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  root.YTSQLockShared = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function makeShared() {
  const DEFAULT_SETTINGS = Object.freeze({
    speed: 1.5,
    maxQuality: true,
  });

  const QUALITY_SCORES = Object.freeze({
    highres: 9000,
    hd4320: 4320,
    hd2880: 2880,
    hd2160: 2160,
    hd1440: 1440,
    hd1080: 1080,
    hd720: 720,
    large: 480,
    medium: 360,
    small: 240,
    tiny: 144,
  });

  function normalizeSpeed(value) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return DEFAULT_SETTINGS.speed;
    }

    const clamped = Math.min(16, Math.max(0.25, parsed));
    return Math.round(clamped * 100) / 100;
  }

  function normalizeSettings(value) {
    return {
      speed: normalizeSpeed(value && value.speed),
      maxQuality: typeof value?.maxQuality === "boolean" ? value.maxQuality : DEFAULT_SETTINGS.maxQuality,
    };
  }

  function qualityScore(quality) {
    if (!quality || quality === "auto") {
      return Number.NEGATIVE_INFINITY;
    }

    if (Object.hasOwn(QUALITY_SCORES, quality)) {
      return QUALITY_SCORES[quality];
    }

    const match = String(quality).match(/\d+/);
    return match ? Number(match[0]) : 0;
  }

  function pickBestQuality(qualities) {
    if (!Array.isArray(qualities)) {
      return null;
    }

    let best = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const quality of qualities) {
      const score = qualityScore(quality);

      if (score > bestScore) {
        best = quality;
        bestScore = score;
      }
    }

    return bestScore === Number.NEGATIVE_INFINITY ? null : best;
  }

  return {
    DEFAULT_SETTINGS,
    normalizeSpeed,
    normalizeSettings,
    pickBestQuality,
  };
});
