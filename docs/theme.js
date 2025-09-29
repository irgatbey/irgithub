const body = document.body;
function applyInitialTheme() {
    const themeToggleButton = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        body.classList.add("light-mode");
        if (themeToggleButton)
            themeToggleButton.innerText = "🌙";
    }
    else {
        body.classList.remove("light-mode");
        if (themeToggleButton)
            themeToggleButton.innerText = "☀️";
    }
}
function toggleTheme() {
    const themeToggleButton = document.getElementById("theme-toggle");
    body.classList.toggle("light-mode");
    if (body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
        if (themeToggleButton)
            themeToggleButton.innerText = "🌙";
    }
    else {
        localStorage.setItem("theme", "dark");
        if (themeToggleButton)
            themeToggleButton.innerText = "☀️";
    }
}
export function initializeTheme() {
    const themeToggleButton = document.getElementById("theme-toggle");
    if (themeToggleButton) {
        themeToggleButton.addEventListener("click", toggleTheme);
    }
    applyInitialTheme();
}
