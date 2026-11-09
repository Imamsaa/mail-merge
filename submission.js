(() => {
  "use strict";
  const config = window.MAIL_MERGE_CONFIG || {};
  const endpoint = String(config.APPS_SCRIPT_URL || "").trim();
  const button = document.getElementById("openSubmissionForm");
  const warning = document.getElementById("configWarning");

  if (!button) return;
  const valid = /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(endpoint);

  if (!valid) {
    button.setAttribute("aria-disabled", "true");
    button.style.opacity = ".55";
    button.style.pointerEvents = "none";
    if (warning) warning.hidden = false;
    return;
  }

  button.href = endpoint + "?view=form";
  button.removeAttribute("aria-disabled");
})();
