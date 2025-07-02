import { checkPassword } from "../../scripts/passwordVerification.mjs";
import {
    exportSettings,
    importSettings,
    downloadFile,
    readFile,
} from "../../scripts/fileSync.mjs";
import { getDateInMinutes } from "../../scripts/date.mjs";

document.addEventListener("DOMContentLoaded", () => {
    const toggles = [
        { id: "darkmode", key: "darkmode" },
        { id: "tempdisable", key: "disabled" },
        { id: "advancedRegex", key: "advancedRegex" },
        { id: "redirectPage", key: "customRedirectEnabled" },
        { id: "password-protection", key: "passwordEnabled" },
    ];
    const values = [{ id: "customPageHref", key: "customPageLink" }];

    // Form
    const statusDiv = document.getElementById("status");
    const form = document.getElementById("settings-form");

    // Buttons
    //// Import/Export
    const exportSettingsButton = document.getElementById("export-settings");
    const importSettingsButton = document.getElementById("import-settings");

    //// Password
    const changePasswordButton = document.querySelector("#set-password");

    //// Block Settings
    const blockSettingsButton = document.querySelector("#blockSettings");

    // Prompts
    //// Password Prompt
    const passwordPromptDivBackground = document.querySelector(
        "#password-prompt-background"
    ) as HTMLElement | null;

    const passwordPromptStatus = document.querySelector(
        "#password-status"
    ) as HTMLElement | null;

    const blockSettingsInput = document.querySelector(
        "#block-settings-prompt #minutes-input"
    ) as HTMLInputElement | null;

    const passwordInput = document.querySelector(
        "#current-password"
    ) as HTMLInputElement | null;
    const confirmPasswordButton = document.querySelector("#confirm-password");

    const passwordWarning = document.querySelector(
        "#password-warning"
    ) as HTMLElement | null;

    //// Block Settings
    const blockSettingsPromptDivBackground = document.querySelector(
        "#enable-block-settings-background"
    ) as HTMLElement | null;

    const blockSettingsCancelButton = document.querySelector(
        "#block-settings-prompt #cancel-button"
    ) as HTMLButtonElement | null;

    const blockSettingsConfirmButton = document.querySelector(
        "#block-settings-prompt #confirm-button"
    ) as HTMLButtonElement | null;

    //// Settings Pauses
    const settingsPausedPromptDivBackground = document.querySelector(
        "#disabled-settings-page"
    ) as HTMLDivElement | null;

    const settingsPausedMinutesLeftStatus = document.querySelector(
        "#disabled-settings-page #minutes-left-span"
    );

    let unlocked = true;
    let blocked = false;

    if (!JSON.parse(localStorage.getItem("passwordEnabled") || "false")) {
        unlocked = true;
    }

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

    // Setup block settings button click
    if (blockSettingsButton !== null) {
        blockSettingsButton.addEventListener("click", () => {
            if (blockSettingsPromptDivBackground !== null) {
                blockSettingsPromptDivBackground.style.display = "";
            }
        });
    }

    // Setup block settings cancel
    if (blockSettingsCancelButton !== null) {
        blockSettingsCancelButton.addEventListener("click", () => {
            if (blockSettingsPromptDivBackground !== null) {
                blockSettingsPromptDivBackground.style.display = "none";
                console.log("Cancelled disable settings");
            } else {
                console.error(
                    "Could not find cancel settings. This should never happen."
                );
            }
        });
    }

    // Setup block settings confirm
    if (blockSettingsConfirmButton !== null) {
        blockSettingsConfirmButton.addEventListener("click", () => {
            if (blockSettingsInput !== null) {
                if (!checkIfDisabled()) {
                    const minutesStr = blockSettingsInput.value;
                    const minutesFloat = parseFloat(minutesStr);

                    if (!isNaN(minutesFloat)) {
                        const endDate = getDateInMinutes(minutesFloat);
                        console.log(
                            "[blockSettingsConfirmButton]: endDate",
                            endDate
                        );
                        localStorage.setItem(
                            "unlockIn",
                            JSON.stringify(endDate)
                        );
                        localStorage.setItem(
                            "settingsLocked",
                            JSON.stringify(true)
                        );
                        updateSettingsBlocked();
                    } else {
                        console.warn(
                            "[blockSettingsConfirmButton]: Could not convert",
                            minutesStr,
                            "to float."
                        );
                    }
                } else {
                    console.warn(
                        "[blockSettingsConfirmButton]: Already disabled."
                    );
                }
            } else {
                console.error(
                    "[blockSettingsConfirmButton]: Could not find input."
                );
            }
        });
    }

    // Load the settings into form
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

    // Save the settings in the form
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

        console.log("[saveSettings]: !blocked, unlocked", !blocked, unlocked);

        if (!blocked && unlocked) {
            save();
        }

        const passwordEnabled = JSON.parse(
            localStorage.getItem("passwordEnabled") || "false"
        );

        console.log("[save]: Password enabled", passwordEnabled);

        if (passwordPromptDivBackground !== null) {
            if (passwordEnabled && !unlocked) {
                passwordPromptDivBackground.style.display = "";
            } else {
                passwordPromptDivBackground.style.display = "none";
            }
        } else {
        }

        if (settingsPausedPromptDivBackground !== null) {
            if (blocked) {
                settingsPausedPromptDivBackground.style.display = "";
            } else {
                settingsPausedPromptDivBackground.style.display = "none";
            }
        }
    }

    // Updates the timeout status in the form
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

    // Updated the prompt that shows when the settings is blocked
    function updateSettingsBlocked() {
        blocked = checkIfDisabled();
        console.log(
            "[updateSettingsBlocked]: checkIfDisabled",
            checkIfDisabled
        );
        if (settingsPausedPromptDivBackground !== null) {
            if (blocked) {
                settingsPausedPromptDivBackground.style.display = "";

                if (settingsPausedMinutesLeftStatus !== null) {
                    const unlockInDate = loadDate("unlockIn");
                    const minutesNow = new Date(Date.now()).getMinutes();
                    const unlockInMinutes = unlockInDate?.getMinutes();

                    if (unlockInMinutes !== undefined) {
                        let minutesToGo = unlockInMinutes - minutesNow;
                        if (minutesToGo < 0) {
                            minutesToGo += 60;
                        }
                        settingsPausedMinutesLeftStatus.innerHTML =
                            minutesToGo.toString();
                    }
                }
            } else {
                settingsPausedPromptDivBackground.style.display = "none";
            }
        }
    }

    // Load the timeout input value
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

    // Save the timeout input value
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

    // Loads a Date object from localstorage
    function loadDate(key: string) {
        const storageItem = localStorage.getItem(key);
        if (storageItem !== null) {
            return new Date(JSON.parse(storageItem));
        } else {
            return null;
        }
    }

    // Checks if settings is disabled
    function checkIfDisabled() {
        const settingsPaused = JSON.parse(
            localStorage.getItem("settingsLocked") || "false"
        );
        const unlockDate = loadDate("unlockIn");

        console.log(
            "[checkIfDisabled]: settingsPaused, unlockDate",
            settingsPaused,
            unlockDate
        );

        if (unlockDate === null || !settingsPaused) {
            if (!settingsPaused) {
                console.log("[checkIfDisabled]: settingsLocked is disabled");
            } else {
                console.warn("[checkIfDisabled]: Date could not be loaded.");
            }
            return false;
        } else {
            const nowMs = Date.now();
            const unlockMs = unlockDate.valueOf();

            console.log(
                "[checkIfDisabled]: nowMs - unlockMs",
                nowMs - unlockMs
            );

            if (nowMs > unlockMs) {
                console.log(
                    "[checkIfDisabled]: Not disabled; After re-enable time."
                );
                return false;
            } else {
                console.log(
                    "[checkIfDisabled]: Disabled; Before re-enable time."
                );
                return true;
            }
        }
    }

    updateSettingsBlocked();
    loadSettings();
    saveSettings();
    loadTimeoutInput();

    setInterval(updateSettingsBlocked, 5000);

    // Setup toggle input change event listeners
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

    if (!JSON.parse(localStorage.getItem("passwordEnabled") || "false")) {
        unlocked = true;
        if (passwordPromptDivBackground !== null) {
            (passwordPromptDivBackground as HTMLElement).style.display = "none";
        }
    } else if (passwordPromptDivBackground !== null) {
        (passwordPromptDivBackground as HTMLElement).style.display = "";
    }

    updateTheme();
});
