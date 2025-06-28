import { checkPassword } from "../../scripts/passwordVerification.mjs";

document.addEventListener("DOMContentLoaded", () => {
    const toggles = [
        { id: "darkmode", key: "darkmode" },
        { id: "tempdisable", key: "disabled" },
        { id: "advancedRegex", key: "advancedRegex" },
        { id: "redirectPage", key: "customRedirectEnabled" },
        { id: "password-protection", key: "passwordEnabled" },
    ];
    const values = [{ id: "customPageHref", key: "customPageLink" }];
    const statusDiv = document.getElementById("status");
    const form = document.getElementById("settings-form");

    const exportSettingsButton = document.getElementById("export-settings");
    const importSettingsButton = document.getElementById("import-settings");

    const changePasswordButton = document.querySelector("#set-password");
    const passwordPromptDivBackground = document.querySelector(
        "#password-prompt-background"
    );
    const passwordPromptStatus = document.querySelector("#password-status");

    const passwordInput = document.querySelector("#current-password");
    const confirmPasswordButton = document.querySelector("#confirm-password");

    const passwordWarning = document.querySelector("#password-warning");

    let unlocked = false;

    // Setup export button click
    exportSettingsButton.addEventListener("click", () => {
        downloadFile("blockerSettings.json", JSON.stringify(exportSettings()));
    });

    // Setup import button click
    importSettingsButton.addEventListener("click", () => {
        const file = readFile();
        file.then((value) => {
            console.log(value);
            importSettings(value);
            loadSettings();
            updateTheme();
        });
    });

    // Setup password button click
    changePasswordButton.addEventListener("click", () => {
        if (
            JSON.parse(localStorage.getItem("passwordEnabled")) &&
            document.querySelector("#password-protection").checked
        ) {
            window.location.href = browser.runtime.getURL(
                "pages/password/password.html"
            );
        } else {
            console.warn(
                "Set password pressed without password protection enabled."
            );
        }
    });

    // Setup confirm password button in password prompt
    confirmPasswordButton.addEventListener("click", async () => {
        const password = passwordInput.value;
        const passwordHash = localStorage.getItem("passwordHash");
        const salt = localStorage.getItem("salt");
        let isCorrect;
        if (!salt || !passwordHash) {
            isCorrect = true;
        } else {
            isCorrect = await checkPassword(password);
        }

        if (!isCorrect) {
            passwordPromptStatus.style.display = "";
            setTimeout(() => {
                passwordPromptStatus.style.display = "none";
            }, 1500);
        } else {
            unlocked = true;
            passwordPromptDivBackground.style.display = "none";
            loadSettings();
            saveSettings();
        }
    });

    // Use localStorage for settings
    function loadSettings() {
        toggles.forEach((t) => {
            const el = document.getElementById(t.id);
            const value = localStorage.getItem(t.key);
            el.checked = value === "true";
        });
        values.forEach((t) => {
            const el = document.getElementById(t.id);
            const value = localStorage.getItem(t.key);
            el.value = value;
        });
    }

    function saveSettings() {
        function save() {
            toggles.forEach((t) => {
                const el = document.getElementById(t.id);
                localStorage.setItem(t.key, el.checked);

                if (t.id === "redirectPage") {
                    const hrefContainer =
                        document.getElementById("custom-page-group");
                    if (el.checked) {
                        hrefContainer.style.display = "";
                    } else {
                        hrefContainer.style.display = "none";
                    }
                }

                if (t.id === "password-protection") {
                    const passwordButton =
                        document.querySelector("#set-password");
                    if (el.checked) {
                        passwordButton.style.display = "";
                    } else {
                        passwordButton.style.display = "none";
                    }
                    if (
                        !localStorage.getItem("passwordHash") &&
                        !localStorage.getItem("salt") &&
                        el.checked
                    ) {
                        passwordWarning.style.display = "";
                    }
                }
            });
            values.forEach((t) => {
                const el = document.getElementById(t.id);
                localStorage.setItem(t.key, el.value);
            });
            updateTheme();
        }

        if (!JSON.parse(localStorage.getItem("passwordEnabled")) || unlocked) {
            save();
        } else {
            passwordPromptDivBackground.style.display = "";
        }
    }

    function updateTimeoutStatus(date) {
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
    saveSettings();
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
