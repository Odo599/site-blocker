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
