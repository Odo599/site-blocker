browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        const url = new URL(details.url);
        var blockedSites = readBlockedSites();

        hostname = url.hostname;
        href = url.href;

        if (hostname.slice(0, 4) === "www.") {
            hostname = hostname.slice(4);
        }

        if (href.slice(0, 8) === "https://") {
            href = href.slice(8);
        }

        if (href.slice(0, 7) === "http://") {
            href = href.slice(7);
        }

        if (
            localStorage.getItem("disabled") != "true" &&
            JSON.parse(localStorage.getItem("timeoutEnd")) < Date.now()
        ) {
            if (blockedSites.some((domain) => hostname === domain)) {
                const whitelistSites = readWhitelistedSites();
                if (!whitelistSites.some((domain) => href === domain)) {
                    return {
                        redirectUrl: browser.runtime.getURL("redirect.html"),
                    };
                }
            }
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
