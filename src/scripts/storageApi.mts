function readBlockedSites() {
    const sites = localStorage.getItem("blockedSites");
    if (sites === null) {
        return [];
    } else {
        return JSON.parse(sites);
    }
}

function writeBlockedSites(sites: Array<string>) {
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

function writeWhitelistedSites(sites: Array<string>) {
    localStorage.setItem("whitelistedSites", JSON.stringify(sites));
}

export {
    readBlockedSites,
    writeBlockedSites,
    readWhitelistedSites,
    writeWhitelistedSites,
};
