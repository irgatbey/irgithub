"use strict";
(() => {
  // src/theme.ts
  var body = document.body;
  function applyInitialTheme() {
    const themeToggleButton = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme");
    if (themeToggleButton) {
      if (savedTheme === "light") {
        body.classList.add("light-mode");
        themeToggleButton.innerHTML = `<span class="material-symbols-outlined">dark_mode</span>`;
      } else {
        body.classList.remove("light-mode");
        themeToggleButton.innerHTML = `<span class="material-symbols-outlined">light_mode</span>`;
      }
    }
  }
  function toggleTheme() {
    const themeToggleButton = document.getElementById("theme-toggle");
    body.classList.toggle("light-mode");
    if (themeToggleButton) {
      if (body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
        themeToggleButton.innerHTML = `<span class="material-symbols-outlined">dark_mode</span>`;
      } else {
        localStorage.setItem("theme", "dark");
        themeToggleButton.innerHTML = `<span class="material-symbols-outlined">light_mode</span>`;
      }
    }
  }
  function initializeTheme() {
    const themeToggleButton = document.getElementById("theme-toggle");
    if (themeToggleButton) {
      themeToggleButton.addEventListener("click", toggleTheme);
    }
    applyInitialTheme();
  }

  // src/interactions.ts
  var activePressableElement = null;
  function handlePress(event) {
    const target = event.target;
    const pressableElement = target.closest(".pressable");
    if (pressableElement) {
      pressableElement.classList.add("press-active");
      activePressableElement = pressableElement;
    }
  }
  function handleRelease() {
    if (activePressableElement) {
      activePressableElement.classList.remove("press-active");
      activePressableElement = null;
    }
  }
  function initializeGlobalInteractions() {
    document.body.addEventListener("mousedown", handlePress);
    document.body.addEventListener("touchstart", handlePress, { passive: true });
    document.body.addEventListener("mouseup", handleRelease);
    document.body.addEventListener("mouseleave", handleRelease);
    document.body.addEventListener("touchend", handleRelease);
  }

  // src/main.ts
  var deferredPrompt;
  var installContainer = document.getElementById("install-container");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installContainer) {
      installContainer.innerHTML = "";
      const installButton = document.createElement("button");
      installButton.id = "install-button";
      installButton.classList.add("pressable");
      installButton.innerHTML = `
      <span class="material-symbols-outlined" style="font-size: 1.2em;">download</span>
      <span>Y\xFCkle</span>
    `;
      installContainer.appendChild(installButton);
      installButton.addEventListener("click", async () => {
        if (installContainer) {
          installContainer.innerHTML = "";
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Kullan\u0131c\u0131 se\xE7imi: ${outcome}`);
        deferredPrompt = null;
      });
    }
  });
  var readLaterApp = document.getElementById("read-later-app");
  if (readLaterApp) {
    readLaterApp.addEventListener("click", (event) => {
      event.preventDefault();
      setTimeout(() => {
        window.location.href = "read-later.html";
      }, 150);
    });
  }
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js").then((registration) => {
        console.log(
          "Service Worker ba\u015Far\u0131yla kaydedildi: ",
          registration.scope
        );
      }).catch((err) => {
        console.log("Service Worker kayd\u0131 ba\u015Far\u0131s\u0131z: ", err);
      });
    });
  }
  window.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    initializeGlobalInteractions();
  });
})();
//# sourceMappingURL=main.js.map
