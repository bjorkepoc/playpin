(function runContentScript() {
  const SOURCE = "yt-speed-quality-lock";
  const shared = globalThis.YTSQLockShared;
  let settings = shared.normalizeSettings();
  let currentUrl = location.href;
  let lastAppliedVideoKey = null;
  let adWasShowing = false;

  function getStoredSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(shared.DEFAULT_SETTINGS, (stored) => {
        resolve(shared.normalizeSettings(stored));
      });
    });
  }

  function injectScript(path, flag) {
    if (document.documentElement.dataset[flag]) {
      return Promise.resolve();
    }

    document.documentElement.dataset[flag] = "true";

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL(path);
      script.onload = () => {
        script.remove();
        resolve();
      };
      script.onerror = resolve;
      (document.head || document.documentElement).append(script);
    });
  }

  async function ensurePageScripts() {
    await injectScript("src/shared.js", "ytSqlockSharedInjected");
    await injectScript("src/page.js", "ytSqlockPageInjected");
  }

  function postSettings() {
    window.postMessage(
      {
        source: SOURCE,
        type: "settings",
        settings,
      },
      location.origin,
    );
  }

  function getVideoKey() {
    try {
      const url = new URL(location.href);
      return url.searchParams.get("v") || url.pathname;
    } catch {
      return location.href;
    }
  }

  function applySpeed() {
    const video = document.querySelector("video");

    if (!video) {
      return false;
    }

    if (Math.abs(video.playbackRate - settings.speed) > 0.01) {
      video.playbackRate = settings.speed;
    }

    video.defaultPlaybackRate = settings.speed;
    return true;
  }

  function isAdShowing() {
    return Boolean(document.querySelector(".ad-showing"));
  }

  function applyCurrentSettings() {
    if (isAdShowing()) {
      return;
    }

    const hasVideo = applySpeed();
    postSettings();

    if (hasVideo) {
      lastAppliedVideoKey = getVideoKey();
    }
  }

  async function refreshSettings({ force = false } = {}) {
    settings = await getStoredSettings();

    if (force || lastAppliedVideoKey !== getVideoKey()) {
      applyCurrentSettings();
    }
  }

  function handlePlaybackChange() {
    setTimeout(() => {
      const adShowing = isAdShowing();

      // YouTube resets the player when an ad ends, so the video needs the settings again.
      if (adWasShowing && !adShowing) {
        lastAppliedVideoKey = null;
      }

      adWasShowing = adShowing;
      refreshSettings();
    }, 250);
  }

  function checkUrlChange() {
    if (currentUrl === location.href) {
      return;
    }

    currentUrl = location.href;
    setTimeout(refreshSettings, 250);
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") {
      return;
    }

    settings = shared.normalizeSettings({
      speed: changes.speed ? changes.speed.newValue : settings.speed,
      maxQuality: changes.maxQuality ? changes.maxQuality.newValue : settings.maxQuality,
    });
    applyCurrentSettings();
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.type === "settings-updated") {
      refreshSettings({ force: true });
    }
  });

  document.addEventListener("loadedmetadata", handlePlaybackChange, true);
  document.addEventListener("playing", handlePlaybackChange, true);
  document.addEventListener("yt-navigate-finish", handlePlaybackChange, true);

  ensurePageScripts().then(refreshSettings);
  setInterval(checkUrlChange, 1000);
})();
