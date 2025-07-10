/*================================================
=                  GLOBAL STATE                  =
==================================================
This variable holds the banner container so we can 
remove or update it without duplicating banners.
================================================*/

let container = null;

/*================================================
=                DEFAULT CONFIG                  =
==================================================
This section defines the default banner settings and
which environments (like staging or dev) the banner
should show up for. Each site can have its own style,
message, and match rules.
================================================*/

const defaultConfig = {
  enabled: true,
  displayDot: false,
  sites: {
    "staging-env": {
      priority: 10,
      match: ["staging", "stage"],
      enabled: true,
      bgColor: "#2ECC71",
      borderColor: "#27AE60",
      message: "You are on STAGING",
    },
    "dev-env": {
      priority: 9,
      match: ["dev"],
      enabled: true,
      bgColor: "#FFC107",
      borderColor: "#FFA000",
      message: "You are on DEV",
    },
  },
};

/*================================================
=            APPLY STORED CONFIG OVERRIDES       =
==================================================
This function merges the default config with any saved
settings from chrome.storage (like toggles in the popup).
================================================*/

function applyOverrides(stored) {
  const updatedSites = {};
  for (const [key, site] of Object.entries(defaultConfig.sites)) {
    updatedSites[key] = { ...site };
    if (stored?.sites && typeof stored.sites[key]?.enabled === "boolean") {
      updatedSites[key].enabled = stored.sites[key].enabled;
    }
  }
  return {
    ...defaultConfig,
    ...stored,
    sites: updatedSites,
  };
}

/*================================================
=                RENDER BANNER                   =
==================================================
This function renders the banner on the page based on
the merged configuration. It matches the current URL
against configured site rules and injects the banner.
================================================*/

function renderBanner(userConfig = {}) {
  const config = applyOverrides(userConfig);
  if (!config.enabled) {
    container?.remove();
    container = null;
    return;
  }
  const currentUrl = window.location.href;
  const sitesList = Object.values(config.sites)
    .filter((site) => site.enabled)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  let matchedSite = null;
  for (const site of sitesList) {
    if (site.match.some((pattern) => currentUrl.includes(pattern))) {
      matchedSite = site;
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
    ? `<style>
         .dot {
           position: fixed;
           right: 0;
           bottom: 0;
           border-radius: 10px 0px 0px 0px;
           ${styles}
         }
       </style>
       <div class="dot">${message}</div>`
    : `<style>
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
       <div class="my-extension-banner">${message}</div>`;
}

/*================================================
=         INITIAL LOAD & CONFIG LISTENER         =
==================================================
This section runs when the content script loads. It fetches
stored config from Chrome's storage and listens for updates
from the popup to re-render the banner in real-time.
================================================*/

chrome.storage.local.get("config", ({ config }) => {
  renderBanner(config || defaultConfig);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateConfig" && message.config) {
    renderBanner(message.config);
  }
});
