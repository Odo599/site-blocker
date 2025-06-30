import { checkPassword } from "../../scripts/passwordVerification.mjs";
import {
    exportSettings,
    importSettings,
    downloadFile,
    readFile,
} from "../../scripts/fileSync.mjs";

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
    ) as HTMLElement | null;
    const passwordPromptStatus = document.querySelector(
        "#password-status"
    ) as HTMLElement | null;

    const passwordInput = document.querySelector(
        "#current-password"
    ) as HTMLInputElement | null;
    const confirmPasswordButton = document.querySelector("#confirm-password");

    const passwordWarning = document.querySelector(
        "#password-warning"
    ) as HTMLElement | null;

    let unlocked = false;

    // Setup export button click
    if (exportSettingsButton !== null) {
        exportSettingsButton.addEventListener("click", () => {
            downloadFile(
                "blockerSettings.json",
                JSON.stringify(exportSettings())
            );
        });
    }

    // Setup import button click
    if (importSettingsButton !== null) {
        importSettingsButton.addEventListener("click", () => {
            const file = readFile();
            file.then((value) => {
                const settings = value as {
                    sites: Array<string>;
                    advancedRegex: boolean;
                    customPageLink: string;
                    customRedirectEnabled: boolean;
                    darkmode: boolean;
                    disabled: boolean;
                };
                console.log(settings);
                importSettings(settings);
                loadSettings();
                updateTheme();
            });
        });
    }

    // Setup password button click
    if (changePasswordButton !== null) {
        changePasswordButton.addEventListener("click", () => {
            if (
                JSON.parse(
                    localStorage.getItem("passwordEnabled") || "false"
                ) &&
                (
                    document.querySelector(
                        "#password-protection"
                    ) as HTMLInputElement
                )?.checked
            ) {
                // @ts-ignore
                window.location.href = browser.runtime.getURL(
                    "src/pages/password/password.html"
                );
            } else {
                console.warn(
                    "Set password pressed without password protection enabled."
                );
            }
        });
    }

    // Setup confirm password button in password prompt
    if (confirmPasswordButton !== null) {
        confirmPasswordButton.addEventListener("click", async () => {
            if (passwordInput !== null) {
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
                    if (passwordPromptStatus !== null) {
                        passwordPromptStatus.style.display = "";
                        setTimeout(() => {
                            passwordPromptStatus.style.display = "none";
                        }, 1500);
                    }
                } else {
                    unlocked = true;
                    if (passwordPromptDivBackground) {
                        passwordPromptDivBackground.style.display = "none";
                    }
                    loadSettings();
                    saveSettings();
                }
            }
        });
    }

    // Use localStorage for settings
    function loadSettings() {
        toggles.forEach((t) => {
            const el = document.getElementById(t.id) as HTMLInputElement | null;
            const value = localStorage.getItem(t.key);
            if (el !== null) {
                el.checked = value === "true";
            }
        });
        values.forEach((t) => {
            const el = document.getElementById(t.id) as HTMLInputElement | null;
            const value = localStorage.getItem(t.key);
            if (el !== null && value !== null) {
                el.value = value;
            }
        });
    }

    function saveSettings() {
        function save() {
            toggles.forEach((t) => {
                const el = document.getElementById(
                    t.id
                ) as HTMLInputElement | null;
                if (el !== null) {
                    localStorage.setItem(t.key, JSON.stringify(el.checked));

                    if (t.id === "redirectPage") {
                        const hrefContainer =
                            document.getElementById("custom-page-group");
                        if (hrefContainer !== null) {
                            if (el.checked) {
                                hrefContainer.style.display = "";
                            } else {
                                hrefContainer.style.display = "none";
                            }
                        }
                    }

                    if (t.id === "password-protection") {
                        const passwordButton = document.querySelector(
                            "#set-password"
                        ) as HTMLButtonElement | null;
                        if (passwordButton !== null) {
                            if (el.checked) {
                                passwordButton.style.display = "";
                            } else {
                                passwordButton.style.display = "none";
                            }
                        }
                        if (
                            !localStorage.getItem("passwordHash") &&
                            !localStorage.getItem("salt") &&
                            el.checked
                        ) {
                            if (passwordWarning !== null) {
                                passwordWarning.style.display = "";
                            }
                        }
                    }
                }
            });
            values.forEach((t) => {
                const el = document.getElementById(
                    t.id
                ) as HTMLInputElement | null;
                if (el !== null) {
                    localStorage.setItem(t.key, el.value);
                }
            });
            updateTheme();
        }

        if (
            !JSON.parse(localStorage.getItem("passwordEnabled") || "false") ||
            unlocked
        ) {
            save();
        } else {
            if (passwordPromptDivBackground !== null) {
                passwordPromptDivBackground.style.display = "";
            }
        }
    }

    function updateTimeoutStatus(date: Date) {
        const timeoutStatusDiv = document.getElementById("timeout-status");
        if (date) {
            if (date > new Date(Date.now())) {
                let hours = date.getHours().toString().padStart(2, "0");
                let minutes = date.getMinutes().toString().padStart(2, "0");
                if (timeoutStatusDiv !== null) {
                    timeoutStatusDiv.innerHTML = `Re-enables at ${hours}:${minutes}`;
                }
            } else {
                localStorage.removeItem("timeoutEnd");
                localStorage.removeItem("timeout");
            }
        } else if (timeoutStatusDiv !== null) {
            timeoutStatusDiv.innerHTML = "No timeout set";
        }
    }

    // Load and save the timeout input value
    function loadTimeoutInput() {
        const input = document.getElementById(
            "timeout"
        ) as HTMLInputElement | null;
        if (input) {
            let timeout = localStorage.getItem("timeoutEnd");
            if (timeout !== null) {
                timeout = JSON.parse(timeout);
            } else {
                timeout = "";
            }
            updateTimeoutStatus(
                new Date(JSON.parse(localStorage.getItem("timeoutEnd") || "0"))
            );
            input.value = timeout || "";
        }
    }

    function saveTimeoutInput() {
        const input = document.getElementById(
            "timeout"
        ) as HTMLInputElement | null;
        if (input) {
            const timeout = parseFloat(input.value);

            localStorage.setItem("timeout", input.value);

            if (!isNaN(timeout) && timeout > 0) {
                const timeoutEnd = timeout * 60000 + Date.now();
                localStorage.setItem("timeoutEnd", JSON.stringify(timeoutEnd));
                updateTimeoutStatus(new Date(timeoutEnd));
            } else {
                localStorage.removeItem("timeoutEnd");
                // updateTimeoutStatus(); TODO why was this here
                setTimeout(() => {
                    const timeoutStatusDiv =
                        document.getElementById("timeout-status");
                    if (timeoutStatusDiv !== null) {
                        timeoutStatusDiv.textContent = "";
                    }
                }, 1500);
            }
        }
    }

    loadSettings();
    saveSettings();
    loadTimeoutInput();

    toggles.forEach((t) => {
        const el = document.getElementById(t.id);
        if (el !== null) {
            el.addEventListener("change", (e) => {
                // localStorage.setItem(t.key, el.checked);
                if (t.key === "darkmode") {
                    updateTheme();
                }
            });
        }
    });

    // Save settings
    if (form !== null) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            saveSettings();
            saveTimeoutInput();
            if (statusDiv !== null) {
                statusDiv.textContent = "Settings saved!";
                setTimeout(() => (statusDiv.textContent = ""), 1500);
            }
        });
    }
    updateTheme();
});
