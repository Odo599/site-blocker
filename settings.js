document.addEventListener("DOMContentLoaded", () => {
    const toggles = [
        { id: "darkmode", key: "darkmode" },
        { id: "tempdisable", key: "disabled" },
        { id: "advancedRegex", key: "advancedRegex" },
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

    function updateTimeoutStatus(date) {
        console.log(date);
        const timeoutStatusDiv = document.getElementById("timeout-status");
        if (date) {
            if (date > Date.now()) {
                let hours = date.getHours().toString().padStart(2, "0");
                let minutes = date.getMinutes().toString().padStart(2, "0");
                timeoutStatusDiv.innerHTML = `Re-enables at ${hours}:${minutes}`;
            } else {
                localStorage.removeItem("timeoutEnd");
                localStorage.removeItem("timeout");
            }
        } else {
            timeoutStatusDiv.innerHTML = "No timeout set";
        }
    }

    // Load and save the timeout input value
    function loadTimeoutInput() {
        const input = document.getElementById("timeout");
        if (input) {
            timeout = localStorage.getItem("timeout");
            updateTimeoutStatus(
                new Date(JSON.parse(localStorage.getItem("timeoutEnd")))
            );
            console.log(timeout);
            input.value = timeout || "";
        }
    }

    function saveTimeoutInput() {
        const input = document.getElementById("timeout");
        const timeout = parseFloat(input.value);

        if (input) {
            localStorage.setItem("timeout", input.value);
        }

        if (!isNaN(timeout) && timeout > 0) {
            const timeoutEnd = timeout * 60000 + Date.now();
            localStorage.setItem("timeoutEnd", timeoutEnd);
            updateTimeoutStatus(new Date(timeoutEnd));
        } else {
            localStorage.removeItem("timeoutEnd");
            updateTimeoutStatus();
            setTimeout(() => {
                const timeoutStatusDiv =
                    document.getElementById("timeout-status");
                timeoutStatusDiv.textContent = "";
            }, 1500);
        }
    }

    loadSettings();
    loadTimeoutInput();

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
        saveTimeoutInput();
        statusDiv.textContent = "Settings saved!";
        setTimeout(() => (statusDiv.textContent = ""), 1500);
    });
    updateTheme();
});
