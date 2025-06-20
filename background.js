function readBlockedSites() {
    const sites = localStorage.getItem("blockedSites");
    if (sites === null) {
        return [];
    } else {
        return JSON.parse(sites);
    }
}

browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        const url = new URL(details.url);
        var blockedSites = readBlockedSites();

        hostname = url.hostname;
        if (hostname.slice(0, 4) === "www.") {
            hostname = hostname.slice(4);
        }

        // Check for exact domain match
        if (blockedSites.some((domain) => hostname === domain)) {
            return {
                redirectUrl: browser.runtime.getURL("redirect.html"),
            };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
