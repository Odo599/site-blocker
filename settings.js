document.addEventListener("DOMContentLoaded", () => {
    const toggles = [
        { id: "darkmode", key: "darkmode" },
        { id: "tempdisable", key: "disabled" },
    ];
    const statusDiv = document.getElementById("status");
    const form = document.getElementById("settings-form");

    // Use localStorage for settings
    function loadSettings() {
        toggles.forEach((t) => {
            const el = document.getElementById(t.id);
            const value = localStorage.getItem(t.key);
            el.checked = value === "true";
        });
    }

    function saveSettings() {
        toggles.forEach((t) => {
            const el = document.getElementById(t.id);
            localStorage.setItem(t.key, el.checked);
        });
        updateTheme();
    }

    loadSettings();

    toggles.forEach((t) => {
        const el = document.getElementById(t.id);
        el.addEventListener("change", (e) => {
            // localStorage.setItem(t.key, el.checked);
            if (t.key === "darkmode") {
                updateTheme();
            }
        });
    });

    // Save settings
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        saveSettings();
        statusDiv.textContent = "Settings saved!";
        setTimeout(() => (statusDiv.textContent = ""), 1500);
    });
    updateTheme();
});
