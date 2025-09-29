const body = document.body;

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

export function initializeTheme() {
  const themeToggleButton = document.getElementById("theme-toggle");
  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", toggleTheme);
  }
  applyInitialTheme();
}
