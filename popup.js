const addSiteInput = document.getElementById("add-site-input");
const addBlacklistSiteButton = document.getElementById(
    "add-site-blacklist-button"
);
const addWhitelistSiteButton = document.getElementById(
    "add-site-whitelist-button"
);

const blacklistSitesList = document.getElementById("blacklist-sites-list");
const whitelistSitesList = document.getElementById("whitelist-sites-list");

// Adds a website to the blacklist
function addSiteBlacklist(site) {
    let sites = readBlockedSites();
    if (!sites.includes(site)) {
        sites.push(site);
        writeBlockedSites(sites);
    }
}

// Removes a website from the blacklist
function removeSiteBlacklist(site) {
    let sites = readBlockedSites();
    sites = sites.filter((item) => item !== site);
    writeBlockedSites(sites);
}

// Run when the add to blacklist button is clicked
function onBlacklistAddButtonClick() {
    const site = addSiteInput.value;
    if (site != "") {
        addSiteBlacklist(site);
        updateBlacklist();
    }
}

// Updates the GUI blacklist display
function updateBlacklist() {
    const blockedSites = readBlockedSites();
    blacklistSitesList.innerHTML = "";

    if (blockedSites.length > 0) {
        for (let i = 0; i < blockedSites.length; i++) {
            blacklistSitesList.appendChild(getListElementDOM(blockedSites[i]));
        }
        blacklistSitesList.style.display = "";
    } else {
        blacklistSitesList.style.display = "none";
    }
}

// Adds a website to the whitelist
function addSiteWhitelist(site) {
    let sites = readWhitelistedSites();
    if (!sites.includes(site)) {
        sites.push(site);
        writeWhitelistedSites(sites);
    }
}

// Removes a website from the whitelist
function removeSiteWhitelist(site) {
    let sites = readWhitelistedSites();
    sites = sites.filter((item) => item !== site);
    writeWhitelistedSites(sites);
}

// Run when the add to whitelist button is clicked
function onWhitelistAddButtonClick() {
    const site = addSiteInput.value;
    if (site != "") {
        addSiteWhitelist(site);
        updateWhitelist();
    }
}

// Updates the GUI whitelist display
function updateWhitelist() {
    const whitelistedSites = readWhitelistedSites();
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

// Gets the DOM for the GUI blacklist display
function getListElementDOM(site, isBlacklist = true) {
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

// Adds click event listener to add to blacklist button
document.addEventListener("DOMContentLoaded", function () {
    addBlacklistSiteButton.addEventListener("click", onBlacklistAddButtonClick);
    addWhitelistSiteButton.addEventListener("click", onWhitelistAddButtonClick);
});

// Init
updateBlacklist();
updateWhitelist();
