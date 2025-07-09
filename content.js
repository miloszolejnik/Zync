let container = null;

/*================================================
=                DEFAULT CONFIG                  =
================================================*/

const defaultConfig = {
  enabled: true,
  displayDot: false,
  sites: {
    "example.com": {
      enabled: true,
      bgColor: "#d32f2f",
      borderColor: "#b71c1c",
      message: "✅ You are visiting example.com!",
    },
    "github.com": {
      enabled: true,
      bgColor: "#24292e",
      borderColor: "#000000",
      message: "🐙 You are on GitHub!",
    },
    "google.com": {
      enabled: true,
      bgColor: "#4285F4",
      borderColor: "#3367d6",
      message: "🔍 You are on Google!",
    },
  },
};

/*================================================
=              APPLY STORED OVERRIDES            =
================================================*/

function applyOverrides(stored) {
  const updatedConfig = {
    ...defaultConfig,
    ...stored,
    sites: { ...defaultConfig.sites },
  };

  // override site.enabled based on stored boolean flags
  if (stored.sites) {
    for (const domain in stored.sites) {
      if (updatedConfig.sites[domain]) {
        updatedConfig.sites[domain].enabled = stored.sites[domain];
      }
    }
  }

  return updatedConfig;
}

/*================================================
=                RENDER BANNER                    =
================================================*/

function renderBanner(userConfig = {}) {
  const config = applyOverrides(userConfig);

  if (!config.enabled) {
    container?.remove();
    container = null;
    return;
  }

  const currentUrl = window.location.href;
  let matchedSite = null;

  for (const domain in config.sites) {
    if (currentUrl.includes(domain) && config.sites[domain].enabled) {
      matchedSite = config.sites[domain];
      break;
    }
  }

  if (!matchedSite) {
    container?.remove();
    container = null;
    return;
  }

  if (!container) {
    container = document.createElement("div");
    container.id = "my-extension-container";
    container.attachShadow({ mode: "open" });
    document.body.prepend(container);
  }

  const shadow = container.shadowRoot;
  const { bgColor, borderColor, message } = matchedSite;

  const styles = `
    padding: 14px 24px;
    background-color: ${bgColor};
    border-bottom: 2px solid ${borderColor};
    font-family: 'Segoe UI', sans-serif;
    font-size: 15px;
    font-weight: bold;
    color: ghostwhite;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    z-index: 99999;
  `;

  shadow.innerHTML = config.displayDot
    ? `
      <style>
        .dot {
          position: fixed;
          right: 0;
          bottom: 0;
          border-radius: 10px 0px 0px 0px;
          ${styles}
        }
      </style>
      <div class="dot">${message}</div>
    `
    : `
      <style>
        .my-extension-banner {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          ${styles}
        }
      </style>
      <div class="my-extension-banner">${message}</div>
    `;
}

/*================================================
=             INITIAL LOAD & UPDATES             =
================================================*/

// Load config from storage and render
chrome.storage.sync.get(defaultConfig, (storedConfig) => {
  renderBanner(storedConfig);
});

// Respond to popup updates
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "updateConfig") {
    renderBanner(request.config);
  }
});
