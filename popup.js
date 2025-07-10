/*================================================
=               POPUP INITIALIZATION             =
==================================================
Loads saved configuration and applies it to all UI
checkboxes in the popup. Also adds listeners to handle
change events and update the storage and banner in
real-time.
================================================*/

document.addEventListener("DOMContentLoaded", () => {
  const ids = ["enabled", "displayDot", "staging-env", "dev-env"];
  const optionsContainer = document.getElementById("options-container");

  // Load saved config and set initial checkbox states
  chrome.storage.local.get("config", ({ config }) => {
    const cfg = config || {};
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        if (id === "enabled" || id === "displayDot") {
          el.checked = cfg[id] ?? true;
        } else {
          el.checked = cfg.sites?.[id]?.enabled ?? true;
        }
      }
    });

    // Hide or show options depending on "enabled" toggle
    optionsContainer.style.maxHeight = cfg.enabled === false ? "0" : "500px";
    optionsContainer.style.opacity = cfg.enabled === false ? "0" : "1";
  });

  // Listen for checkbox changes and update config
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", () => {
        chrome.storage.local.get("config", ({ config }) => {
          const updated = {
            ...(config || {}),
            sites: { ...(config?.sites || {}) },
          };

          // Apply change
          if (id === "enabled" || id === "displayDot") {
            updated[id] = el.checked;

            // Toggle options visibility on "enabled"
            if (id === "enabled") {
              optionsContainer.style.maxHeight = el.checked ? "500px" : "0";
              optionsContainer.style.opacity = el.checked ? "1" : "0";
            }
          } else {
            updated.sites[id] = {
              ...updated.sites[id],
              enabled: el.checked,
            };
          }

          // Save and notify content script
          chrome.storage.local.set({ config: updated }, () => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  action: "updateConfig",
                  config: updated,
                });
              }
            });
          });
        });
      });
    }
  });
});
