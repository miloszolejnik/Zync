/*================================================
=                  DEFAULT CONFIG                 =
================================================*/

const defaultConfig = {
  enabled: true,
  displayDot: false,
  sites: {
    "example.com": true,
    "github.com": true,
    "google.com": true,
  },
};

/*================================================
=               SEND CONFIG UPDATE                =
================================================*/

function sendConfigUpdate(config) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "updateConfig", config });
    }
  });
}

/*================================================
=                 TOGGLE OPTIONS                   =
================================================*/

function toggleOptions(enabled) {
  const optionsContainer = document.getElementById("options-container");
  optionsContainer.classList.toggle("hidden", !enabled);
}

/*================================================
=                  SAVE SETTINGS                   =
================================================*/

function saveSettings() {
  const newConfig = {
    enabled: document.getElementById("enabled").checked,
    displayDot: document.getElementById("displayDot").checked,
    sites: {
      "example.com": document.getElementById("example").checked,
      "github.com": document.getElementById("github").checked,
      "google.com": document.getElementById("google").checked,
    },
  };
  chrome.storage.sync.set(newConfig, () => {
    sendConfigUpdate(newConfig);
  });

  toggleOptions(newConfig.enabled);
}

/*================================================
=                 LOAD SETTINGS                    =
================================================*/

function loadSettings() {
  chrome.storage.sync.get(defaultConfig, (stored) => {
    document.getElementById("enabled").checked = stored.enabled;
    document.getElementById("displayDot").checked = stored.displayDot;
    document.getElementById("example").checked = stored.sites["example.com"];
    document.getElementById("github").checked = stored.sites["github.com"];
    document.getElementById("google").checked = stored.sites["google.com"];

    toggleOptions(stored.enabled);
  });
}

/*================================================
=             DOM CONTENT LOADED SETUP             =
================================================*/

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();

  document.getElementById("enabled").addEventListener("change", () => {
    saveSettings();
  });

  document
    .querySelectorAll("#options-container input[type=checkbox]")
    .forEach((input) => {
      input.addEventListener("change", saveSettings);
    });
});
