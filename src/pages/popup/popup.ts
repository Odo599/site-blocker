import { checkPassword } from "../../scripts/passwordVerification.mjs";
import {
    readBlockedSites,
    writeBlockedSites,
    readWhitelistedSites,
    writeWhitelistedSites,
} from "../../scripts/storageApi.mjs";

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

    let unlocked = false;

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
        if (unlocked) {
            let sites = readBlockedSites();
            if (!sites.includes(site)) {
                sites.push(site);
                writeBlockedSites(sites);
            }
        }
    }

    // Removes a website from the blacklist
    function removeSiteBlacklist(site: string) {
        if (unlocked) {
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
        if (unlocked) {
            let sites = readWhitelistedSites();
            if (!sites.includes(site)) {
                sites.push(site);
                writeWhitelistedSites(sites);
            }
        }
    }

    // Removes a website from the whitelist
    function removeSiteWhitelist(site: string) {
        if (unlocked) {
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
        let title = document.createElement("h2");
        let remove = document.createElement("button");

        if (!isBlacklist) {
            prefixText = "Whitelisted: ";
            prefixClass = "whitelisted-prefix";
        }

        prefixSpan.textContent = prefixText;
        prefixSpan.className = prefixClass;

        title.appendChild(prefixSpan);
        title.innerHTML += site;
        title.className = "site-title";

        remove.className = "site-remove";
        remove.textContent = "x";

        if (isBlacklist) {
            remove.addEventListener("click", onBlacklistRemoveClick);
        } else {
            remove.addEventListener("click", onWhitelistRemoveClick);
        }

        div.className = "site-item";
        div.appendChild(title);
        div.appendChild(remove);

        return div;
    }

    function toggleTheme() {
        const isCurrentlyDark = JSON.parse(
            localStorage.getItem("darkmode") || "false"
        );
        localStorage.setItem("darkmode", JSON.stringify(!isCurrentlyDark));
        updateTheme();
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

    // Init
    updateBlacklist();
    updateWhitelist();
    updateRegexWarning();
});
