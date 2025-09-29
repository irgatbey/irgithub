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

  // src/read-later.ts
  var dbName = "PwaHubDatabase";
  var storeName = "articles";
  var db;
  var form = document.getElementById("add-article-form");
  var urlInput = document.getElementById("url-input");
  var articleList = document.getElementById("article-list");
  function openDatabase() {
    const request = indexedDB.open(dbName, 1);
    request.onerror = (event) => console.error("Veritaban\u0131 hatas\u0131:", event.target.error);
    request.onsuccess = (event) => {
      db = event.target.result;
      renderInitialArticles();
    };
    request.onupgradeneeded = (event) => {
      const db2 = event.target.result;
      if (!db2.objectStoreNames.contains(storeName)) {
        db2.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
      }
    };
  }
  function createArticleElement(article) {
    const li = document.createElement("li");
    li.dataset.id = article.id;
    li.innerHTML = `
    <a href="${article.url}" target="_blank">${article.title}</a>
    <button class="delete-btn pressable icon-button">
      <span class="material-symbols-outlined">delete</span>
    </button>
  `;
    return li;
  }
  async function renderInitialArticles() {
    if (!db) return;
    let skeletonHTML = "";
    for (let i = 0; i < 3; i++) {
      skeletonHTML += '<li class="skeleton"></li>';
    }
    articleList.innerHTML = skeletonHTML;
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const getAllRequest = store.getAll();
    getAllRequest.onerror = (event) => console.error("Makaleler al\u0131namad\u0131:", event.target.error);
    getAllRequest.onsuccess = () => {
      articleList.innerHTML = "";
      const articles = getAllRequest.result.reverse();
      if (articles.length === 0) {
        const emptyStateHTML = `
        <div class="empty-state-container">
          <span class="material-symbols-outlined icon">inbox</span>
          <p class="title">Listeniz Hen\xFCz Bo\u015F</p>
          <p>Kaydetmek istedi\u011Finiz makalelerin linklerini yukar\u0131daki alana yap\u0131\u015Ft\u0131r\u0131n.</p>
        </div>
      `;
        articleList.innerHTML = emptyStateHTML;
      } else {
        articles.forEach((article) => {
          const li = createArticleElement(article);
          articleList.appendChild(li);
        });
      }
    };
  }
  function addArticle(event) {
    event.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;
    let title;
    try {
      title = new URL(url).hostname;
    } catch (error) {
      alert("L\xFCtfen ge\xE7erli bir URL girin.");
      return;
    }
    const newArticleData = { url, title, savedAt: /* @__PURE__ */ new Date() };
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const addRequest = store.add(newArticleData);
    addRequest.onerror = (event2) => console.error("Makale eklenemedi:", event2.target.error);
    addRequest.onsuccess = () => {
      urlInput.value = "";
      const newArticleWithId = { ...newArticleData, id: addRequest.result };
      const emptyState = articleList.querySelector(".empty-state-container");
      if (emptyState) {
        articleList.innerHTML = "";
      }
      const li = createArticleElement(newArticleWithId);
      li.classList.add("item-pop-in-active");
      articleList.prepend(li);
    };
  }
  function deleteArticle(event) {
    const target = event.target;
    const deleteButton = target.closest(".delete-btn");
    if (deleteButton) {
      const li = deleteButton.closest("li");
      if (li && li.dataset.id) {
        const id = parseInt(li.dataset.id, 10);
        li.classList.add("item-collapsing");
        li.addEventListener(
          "transitionend",
          () => {
            const transaction = db.transaction(storeName, "readwrite");
            const store = transaction.objectStore(storeName);
            const deleteRequest = store.delete(id);
            deleteRequest.onerror = (event2) => console.error(
              "Makale silinemedi:",
              event2.target.error
            );
            deleteRequest.onsuccess = () => {
              li.remove();
              if (articleList.children.length === 0) {
                renderInitialArticles();
              }
            };
          },
          { once: true }
        );
      }
    }
  }
  form.addEventListener("submit", addArticle);
  articleList.addEventListener("click", deleteArticle);
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
  openDatabase();
  window.addEventListener("DOMContentLoaded", () => {
    initializeTheme();
    initializeGlobalInteractions();
  });
})();
//# sourceMappingURL=read-later.js.map
