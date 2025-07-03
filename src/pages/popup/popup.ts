import { checkPassword } from "../../scripts/passwordVerification.mjs";
import {
    readBlockedSites,
    writeBlockedSites,
    readWhitelistedSites,
    writeWhitelistedSites,
} from "../../scripts/storageApi.mjs";
import { getDateInMinutes, getMinutesUntilDate } from "../../scripts/date.mjs";
import {
    getSiteStatus,
    addSite,
    removeSite,
} from "../../scripts/sitePauseChange.mjs";
console.log(getSiteStatus);
console.log(addSite);
console.log(removeSite);

document.addEventListener("DOMContentLoaded", () => {
    const addSiteInput = document.getElementById(
        "add-site-input"
    ) as HTMLInputElement | null;
    const addBlacklistSiteButton = document.getElementById(
        "add-site-blacklist-button"
    );
    const addWhitelistSiteButton = document.getElementById(
        "add-site-whitelist-button"
    );

    const blacklistSitesList = document.getElementById("blacklist-sites-list");
    const whitelistSitesList = document.getElementById("whitelist-sites-list");

    const passwordInput = document.querySelector(
        "#current-password"
    ) as HTMLInputElement | null;
    const confirmPasswordButton = document.querySelector("#confirm-password");

    const passwordPromptDivBackground = document.querySelector(
        "#password-prompt-background"
    ) as HTMLElement | null;

    const passwordPromptStatus = document.querySelector(
        "#password-status"
    ) as HTMLElement | null;

    const accordionHeader = document.querySelector(".accordion-header");
    const accordion = document.querySelector(".accordion");

    const themeSwitchButton = document.querySelector("#floating-button-theme");

    // Settings Pauses
    const settingsPausedPromptDivBackground = document.querySelector(
        "#disabled-settings-page"
    ) as HTMLDivElement | null;

    const settingsPausedMinutesLeftStatus = document.querySelector(
        "#disabled-settings-page #minutes-left-span"
    );

    // Pause site
    const pausePromptDivBackground = document.querySelector(
        "#pause-site-prompt-background"
    ) as HTMLDivElement | null;

    const pausePromptPageStatusSpan = document.querySelector(
        "#pause-site-prompt-background #page-pause-status"
    ) as HTMLSpanElement | null;

    const pausePromptConfirmButton = document.querySelector(
        "#pause-site-prompt-background #confirm-button"
    );

    const pausePromptCancelButton = document.querySelector(
        "#pause-site-prompt-background #cancel-button"
    );

    const pausePromptMinutesInput = document.querySelector(
        "#pause-site-prompt-background #minutes-input"
    ) as HTMLInputElement | null;

    let unlocked = false;
    let blocked = false;

    // Check if password is enabled
    if (!JSON.parse(localStorage.getItem("passwordEnabled") || "false")) {
        unlocked = true;
        if (passwordPromptDivBackground !== null) {
            (passwordPromptDivBackground as HTMLElement).style.display = "none";
        }
    } else if (passwordPromptDivBackground !== null) {
        (passwordPromptDivBackground as HTMLElement).style.display = "";
    }

    // Adds a website to the blacklist
    function addSiteBlacklist(site: string) {
        if (unlocked && !blocked) {
            let sites = readBlockedSites();
            if (!sites.includes(site)) {
                sites.push(site);
                writeBlockedSites(sites);
            }
        }
    }

    // Removes a website from the blacklist
    function removeSiteBlacklist(site: string) {
        if (unlocked && !blocked) {
            let sites = readBlockedSites();
            sites = sites.filter((item: string) => item !== site);
            writeBlockedSites(sites);
        }
    }

    // Run when the add to blacklist button is clicked
    function onBlacklistAddButtonClick() {
        if (addSiteInput !== null) {
            const site = addSiteInput.value;
            if (site != "") {
                addSiteBlacklist(site);
                updateBlacklist();
            }
        }
    }

    // Updates the GUI blacklist display
    function updateBlacklist() {
        if (blacklistSitesList !== null) {
            const blockedSites = readBlockedSites();
            blacklistSitesList.innerHTML = "";

            if (blockedSites.length > 0) {
                for (let i = 0; i < blockedSites.length; i++) {
                    blacklistSitesList.appendChild(
                        getListElementDOM(blockedSites[i])
                    );
                }
                blacklistSitesList.style.display = "";
            } else {
                blacklistSitesList.style.display = "none";
            }
        }
    }

    // Adds a website to the whitelist
    function addSiteWhitelist(site: string) {
        if (unlocked && !blocked) {
            let sites = readWhitelistedSites();
            if (!sites.includes(site)) {
                sites.push(site);
                writeWhitelistedSites(sites);
            }
        }
    }

    // Removes a website from the whitelist
    function removeSiteWhitelist(site: string) {
        if (unlocked && !blocked) {
            let sites = readWhitelistedSites();
            sites = sites.filter((item: string) => item !== site);
            writeWhitelistedSites(sites);
        }
    }

    // Run when the add to whitelist button is clicked
    function onWhitelistAddButtonClick() {
        if (addSiteInput !== null) {
            const site = addSiteInput.value;
            if (site != "") {
                addSiteWhitelist(site);
                updateWhitelist();
            }
        }
    }

    // Updates the GUI whitelist display
    function updateWhitelist() {
        const whitelistedSites = readWhitelistedSites();
        if (whitelistSitesList !== null) {
            whitelistSitesList.innerHTML = "";

            if (whitelistedSites.length > 0) {
                for (let i = 0; i < whitelistedSites.length; i++) {
                    whitelistSitesList.appendChild(
                        getListElementDOM(whitelistedSites[i], false)
                    );
                    whitelistSitesList.style.display = "";
                }
            } else {
                whitelistSitesList.style.display = "none";
            }
        }
    }

    // Gets the DOM for the GUI blacklist display
    function getListElementDOM(site: string, isBlacklist = true) {
        function onBlacklistRemoveClick() {
            removeSiteBlacklist(site);
            updateBlacklist();
        }
        function onWhitelistRemoveClick() {
            removeSiteWhitelist(site);
            updateWhitelist();
        }
        let prefixText = "Blocked: ";
        let prefixClass = "blocked-prefix";

        let div = document.createElement("div");
        let prefixSpan = document.createElement("span");
        let titleH2 = document.createElement("h2");
        let removeButton = document.createElement("button");
        let pauseButton = document.createElement("button");
        let sitePausedStatus = document.createElement("p");

        const isPaused = getSiteStatus(site);

        if (!isBlacklist) {
            prefixText = "Whitelisted: ";
            prefixClass = "whitelisted-prefix";
        }

        prefixSpan.textContent = prefixText;
        prefixSpan.className = prefixClass;

        titleH2.appendChild(prefixSpan);
        titleH2.innerHTML += site;
        titleH2.className = "site-title";

        removeButton.className = "site-remove small-right-button";
        removeButton.textContent = "x";

        pauseButton.className = "site-pause small-right-button";
        pauseButton.textContent = "pause";
        pauseButton.addEventListener("click", () => {
            openPauseSiteEdit(site);
        });

        let endMs = isPaused?.ends;

        if (endMs && isPaused?.paused) {
            let minutesToGo = getMinutesUntilDate(endMs);
            sitePausedStatus.textContent =
                Math.round(minutesToGo).toString() + " minutes until unblocked";
        }

        sitePausedStatus.className = "site-pause-status";
        if (!isPaused || !isPaused.paused) {
            sitePausedStatus.style.display = "none";
        }

        if (isBlacklist) {
            if (!isPaused?.paused) {
                removeButton.addEventListener("click", onBlacklistRemoveClick);
            } else {
                removeButton.style.display = "none";
                let intervalId = setInterval(() => {
                    let status = getSiteStatus(site);
                    if (status?.paused) {
                        let endMs = status.ends;
                        if (endMs) {
                            sitePausedStatus.textContent =
                                Math.round(
                                    getMinutesUntilDate(endMs)
                                ).toString() + " minutes until unblocked";
                        }
                    } else {
                        updateBlacklist();
                        clearInterval(intervalId);
                    }
                }, 500);
            }
        } else {
            removeButton.addEventListener("click", onWhitelistRemoveClick);
        }

        div.className = "site-item";
        div.appendChild(titleH2);
        if (isBlacklist) {
            div.appendChild(sitePausedStatus);
            if (!isPaused?.paused) {
                div.appendChild(pauseButton);
            }
        }
        div.appendChild(removeButton);

        return div;
    }

    function openPauseSiteEdit(site: string) {
        console.log(site);
        if (pausePromptDivBackground !== null) {
            pausePromptDivBackground.style.display = "";
        }
        console.log(pausePromptDivBackground);
        if (pausePromptPageStatusSpan !== null) {
            pausePromptPageStatusSpan.textContent = site;
        }
    }

    function toggleTheme() {
        const isCurrentlyDark = JSON.parse(
            localStorage.getItem("darkmode") || "false"
        );
        localStorage.setItem("darkmode", JSON.stringify(!isCurrentlyDark));
        updateTheme();
    }

    if (pausePromptCancelButton) {
        pausePromptCancelButton.addEventListener("click", () => {
            if (pausePromptDivBackground) {
                pausePromptDivBackground.style.display = "none";
            }
        });
    }

    if (pausePromptConfirmButton) {
        pausePromptConfirmButton.addEventListener("click", () => {
            if (pausePromptMinutesInput) {
                const minutesStr = pausePromptMinutesInput.value;
                const minutesFloat = parseFloat(minutesStr);

                if (!isNaN(minutesFloat)) {
                    if (pausePromptPageStatusSpan) {
                        if (pausePromptPageStatusSpan.textContent) {
                            removeSite(pausePromptPageStatusSpan.textContent);
                            addSite({
                                href: pausePromptPageStatusSpan.textContent,
                                ends: getDateInMinutes(minutesFloat),
                            });
                            updateBlacklist();
                            if (pausePromptDivBackground) {
                                pausePromptDivBackground.style.display = "none";
                            }
                        }
                    }
                } else {
                    console.log(
                        "[pausePromptConfirmButton]:",
                        minutesStr,
                        "could not be converted to float."
                    );
                }
            }
        });
    }

    // Adds click event listener to add to blacklist button
    if (addBlacklistSiteButton !== null) {
        addBlacklistSiteButton.addEventListener(
            "click",
            onBlacklistAddButtonClick
        );
    }

    if (addWhitelistSiteButton !== null) {
        addWhitelistSiteButton.addEventListener(
            "click",
            onWhitelistAddButtonClick
        );
    }

    if (accordionHeader !== null) {
        accordionHeader.addEventListener("click", () => {
            if (accordion !== null) {
                const content = accordion.querySelector(
                    ".accordion-content"
                ) as HTMLElement | null;
                if (content !== null) {
                    if (accordion.classList.contains("open")) {
                        content.style.maxHeight = "";
                        accordion.classList.remove("open");
                    } else {
                        content.style.maxHeight = content.scrollHeight + "px";
                        accordion.classList.add("open");
                    }
                }
            }
        });
    }

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
                    if (passwordPromptDivBackground !== null) {
                        passwordPromptDivBackground.style.display = "none";
                    }
                }
            }
        });
    }

    if (themeSwitchButton !== null) {
        themeSwitchButton.addEventListener("click", toggleTheme);
    }

    function updateRegexWarning() {
        const regexWarning = document.querySelector(
            ".advanced-regex-warning"
        ) as HTMLElement | null;
        if (
            !JSON.parse(localStorage.getItem("advancedRegex") || "false") &&
            regexWarning
        ) {
            regexWarning.style.display = "none";
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

    // Init
    updateBlacklist();
    updateWhitelist();
    updateRegexWarning();
    updateSettingsBlocked();
});
