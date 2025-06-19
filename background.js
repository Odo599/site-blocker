const blockedSites = ["example.com"];

browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        const url = new URL(details.url);
        if (blockedSites.some((domain) => url.hostname.includes(domain))) {
            return {
                redirectUrl: browser.runtime.getURL("redirect.html"),
            };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
