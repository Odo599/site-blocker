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
        console.log(blockedSites);
        alert(blockedSites);
        if (blockedSites.some((domain) => url.hostname.includes(domain))) {
            return {
                redirectUrl: browser.runtime.getURL("redirect.html"),
            };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
