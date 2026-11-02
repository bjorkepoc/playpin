(function runPopup() {
  const shared = globalThis.YTSQLockShared;
  const speedInput = document.getElementById("speed");
  const maxQualityInput = document.getElementById("maxQuality");
  const currentRate = document.getElementById("currentRate");
  const status = document.getElementById("status");
  const saveButton = document.getElementById("save");
  const segments = [...document.querySelectorAll("[data-speed]")];
  const storage = globalThis.chrome?.storage?.sync || {
    get(defaults, callback) {
      callback(shared.normalizeSettings(JSON.parse(localStorage.getItem("yt-sqlock-settings") || "null") || defaults));
    },
    set(settings, callback) {
      localStorage.setItem("yt-sqlock-settings", JSON.stringify(settings));
      callback();
    },
  };

  function showStatus(text) {
    status.textContent = text;
    setTimeout(() => {
      if (status.textContent === text) {
        status.textContent = "";
      }
    }, 1500);
  }

  function render(settings) {
    speedInput.value = String(settings.speed);
    maxQualityInput.checked = settings.maxQuality;
    currentRate.textContent = `${settings.speed}x`;

    for (const segment of segments) {
      segment.setAttribute("aria-pressed", String(Number(segment.dataset.speed) === settings.speed));
    }
  }

  function load() {
    storage.get(shared.DEFAULT_SETTINGS, (stored) => {
      render(shared.normalizeSettings(stored));
    });
  }

  function save() {
    const settings = shared.normalizeSettings({
      speed: speedInput.value,
      maxQuality: maxQualityInput.checked,
    });

    storage.set(settings, () => {
      render(settings);
      showStatus("Saved");
    });
  }

  for (const segment of segments) {
    segment.addEventListener("click", () => {
      const settings = shared.normalizeSettings({
        speed: segment.dataset.speed,
        maxQuality: maxQualityInput.checked,
      });
      render(settings);
      save();
    });
  }

  speedInput.addEventListener("input", () => {
    render(shared.normalizeSettings({
      speed: speedInput.value,
      maxQuality: maxQualityInput.checked,
    }));
  });

  saveButton.addEventListener("click", save);
  speedInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      save();
    }
  });

  load();
})();
