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

function readWhitelistedSites() {
    const sites = localStorage.getItem("whitelistedSites");
    if (sites === null) {
        return [];
    } else {
        return JSON.parse(sites);
    }
}

function writeWhitelistedSites(sites) {
    localStorage.setItem("whitelistedSites", JSON.stringify(sites));
}
