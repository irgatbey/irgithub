import { initializeTheme } from "./theme";
import { initializeGlobalInteractions } from "./interactions";

let deferredPrompt: any;
const installContainer = document.getElementById("install-container");

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
      <span>Yükle</span>
    `;
    installContainer.appendChild(installButton);

    installButton.addEventListener("click", async () => {
      if (installContainer) {
        installContainer.innerHTML = "";
      }
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Kullanıcı seçimi: ${outcome}`);
      deferredPrompt = null;
    });
  }
});

const readLaterApp = document.getElementById("read-later-app");

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
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log(
          "Service Worker başarıyla kaydedildi: ",
          registration.scope
        );
      })
      .catch((err) => {
        console.log("Service Worker kaydı başarısız: ", err);
      });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initializeTheme();
  initializeGlobalInteractions();
});
