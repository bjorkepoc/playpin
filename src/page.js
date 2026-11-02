(function runPageScript() {
  const SOURCE = "yt-speed-quality-lock";
  const shared = globalThis.YTSQLockShared;
  let settings = null;

  function getPlayer() {
    return document.getElementById("movie_player");
  }

  function callPlayer(method, ...args) {
    const player = getPlayer();

    if (!player || typeof player[method] !== "function") {
      return undefined;
    }

    try {
      return player[method](...args);
    } catch {
      return undefined;
    }
  }

  function applySpeed() {
    const video = document.querySelector("video");

    if (video && Math.abs(video.playbackRate - settings.speed) > 0.01) {
      video.playbackRate = settings.speed;
    }

    callPlayer("setPlaybackRate", settings.speed);
  }

  function applyQuality() {
    if (!settings.maxQuality) {
      return;
    }

    const levels = callPlayer("getAvailableQualityLevels") || [];
    const best = shared.pickBestQuality(levels);

    if (!best) {
      return;
    }

    callPlayer("setPlaybackQualityRange", best, best);
  }

  function applySettings() {
    if (!settings) {
      return;
    }

    applySpeed();
    applyQuality();
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data || event.data.source !== SOURCE || event.data.type !== "settings") {
      return;
    }

    settings = shared.normalizeSettings(event.data.settings);
    applySettings();
  });
})();
