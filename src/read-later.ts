import { initializeTheme } from "./theme";
import { initializeGlobalInteractions } from "./interactions";

const dbName = "PwaHubDatabase";
const storeName = "articles";
let db: IDBDatabase;

const form = document.getElementById("add-article-form") as HTMLFormElement;
const urlInput = document.getElementById("url-input") as HTMLInputElement;
const articleList = document.getElementById("article-list") as HTMLUListElement;

function openDatabase() {
  const request = indexedDB.open(dbName, 1);
  request.onerror = (event) =>
    console.error("Veritabanı hatası:", (event.target as IDBRequest).error);
  request.onsuccess = (event) => {
    db = (event.target as IDBOpenDBRequest).result;
    renderInitialArticles();
  };
  request.onupgradeneeded = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
    }
  };
}

function createArticleElement(article: any): HTMLLIElement {
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

  getAllRequest.onerror = (event) =>
    console.error("Makaleler alınamadı:", (event.target as IDBRequest).error);

  getAllRequest.onsuccess = () => {
    articleList.innerHTML = "";
    const articles = getAllRequest.result.reverse();

    if (articles.length === 0) {
      const emptyStateHTML = `
        <div class="empty-state-container">
          <span class="material-symbols-outlined icon">inbox</span>
          <p class="title">Listeniz Henüz Boş</p>
          <p>Kaydetmek istediğiniz makalelerin linklerini yukarıdaki alana yapıştırın.</p>
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

function addArticle(event: SubmitEvent) {
  event.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return;
  let title: string;
  try {
    title = new URL(url).hostname;
  } catch (error) {
    alert("Lütfen geçerli bir URL girin.");
    return;
  }
  const newArticleData = { url, title, savedAt: new Date() };
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);
  const addRequest = store.add(newArticleData);

  addRequest.onerror = (event) =>
    console.error("Makale eklenemedi:", (event.target as IDBRequest).error);

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

function deleteArticle(event: MouseEvent) {
  const target = event.target as HTMLElement;
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
          deleteRequest.onerror = (event) =>
            console.error(
              "Makale silinemedi:",
              (event.target as IDBRequest).error
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

openDatabase();

window.addEventListener("DOMContentLoaded", () => {
  initializeTheme();
  initializeGlobalInteractions();
});
