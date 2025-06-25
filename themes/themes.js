function updateTheme() {
    const root = document.documentElement;
    const darkMode = localStorage.getItem("darkmode");
    root.classList.remove("light-theme", "dark-theme");
    if (darkMode === "true") {
        root.classList.add("dark-theme");
    } else {
        root.classList.add("light-theme");
    }
}

updateTheme();
window.addEventListener("storage", (e) => {
    if (e.key === "darkmode") updateTheme();
});
