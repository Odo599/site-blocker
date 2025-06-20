const addSiteInput = document.getElementById("add-site-input");
const addSiteButton = document.getElementById("add-site-button");

const sitesList = document.getElementById("sites-list");

console.log(addSiteButton);
console.log(addSiteInput);

function readBlockedSites() {
    const sites = localStorage.getItem("blockedSites");
    if (sites === null) {
        return [];
    } else {
        return JSON.parse(sites);
    }
}

function writeBlockedSites(sites) {
    localStorage.setItem("blockedSites", JSON.stringify(sites));
}

function clearBlockedSites() {
    writeBlockedSites([]);
}

function addSite(site) {
    let sites = readBlockedSites();
    if (!sites.includes(site)) {
        sites.push(site);
        writeBlockedSites(sites);
    }
}

function removeSite(site) {
    let sites = readBlockedSites();
    sites = sites.filter((item) => item !== site);
    writeBlockedSites(sites);
}

function onButtonClick() {
    const site = addSiteInput.value;
    if (site != "") {
        addSite(site);
        updateList();
    }
}

function getListElementDOM(site) {
    function onRemoveButtonClick() {
        removeSite(site);
        updateList();
    }
    let div = document.createElement("div");
    let title = document.createElement("h2");
    let remove = document.createElement("button");

    title.textContent = site;
    title.className = "site-title";

    remove.className = "site-remove";
    remove.textContent = "×"; // Add x to the button
    remove.addEventListener("click", onRemoveButtonClick);

    div.className = "site-item";
    div.appendChild(title);
    div.appendChild(remove);

    return div;
}

function updateList() {
    const blockedSites = readBlockedSites();
    sitesList.innerHTML = "";

    for (let i = 0; i < blockedSites.length; i++) {
        sitesList.appendChild(getListElementDOM(blockedSites[i]));
    }
}

document.addEventListener("DOMContentLoaded", function () {
    addSiteButton.addEventListener("click", onButtonClick);
});

// INIT
updateList();
