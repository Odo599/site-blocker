// Website Blocking Logic
browser.webRequest.onBeforeRequest.addListener(
    function (details) {
        const url = new URL(details.url);
        var blockedSites = readBlockedSites();
        const whitelistSites = readWhitelistedSites();

        const advancedRegex = localStorage.getItem("advancedRegex") === "true";

        hostname = url.hostname;
        href = url.href;

        function testRegex(domain, url) {
            var regex = RegExp(domain, "i");
            if (!advancedRegex) {
                var regex = convertToRegex(domain);
            }
            console.log(advancedRegex, regex, url);
            return regex.test(url);
        }

        function convertToRegex(domain) {
            const escaped = domain.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&");
            const wildcarded = escaped.replace(/\*/g, ".*");
            const anchored = "^" + wildcarded + "$";
            return new RegExp(anchored, "i");
        }

        href = clearUrl(href);

        const matchesBlocked = blockedSites.some((domain) =>
            testRegex(domain, href)
        );
        const matchesWhitelisted = whitelistSites.some((domain) =>
            testRegex(domain, href)
        );

        if (
            // Check if still enabled
            localStorage.getItem("disabled") != "true" &&
            // Check if timeout is active
            JSON.parse(localStorage.getItem("timeoutEnd")) < Date.now() &&
            // Check if site is blocked
            matchesBlocked &&
            // Check if site is not whitelisted
            !matchesWhitelisted
        ) {
            const customRedirect = JSON.parse(
                localStorage.getItem("customRedirectEnabled")
            );
            let redirectHref;
            if (customRedirect) {
                redirectHref =
                    "https://" + localStorage.getItem("customPageLink");
            } else {
                redirectHref = browser.runtime.getURL(
                    "../pages/redirect/redirect.html"
                );
            }
            console.log(redirectHref);
            return {
                redirectUrl: redirectHref,
            };
        }
    },
    { urls: ["<all_urls>"], types: ["main_frame"] },
    ["blocking"]
);

function addSiteBlacklist(site) {
    let sites = readBlockedSites();
    if (!sites.includes(site)) {
        sites.push(site);
        writeBlockedSites(sites);
    }
}

// Remove https://*, http://*, www.* & */ from url
function clearUrl(url) {
    if (url.slice(0, 8) === "https://") {
        url = url.slice(8);
    }

    if (url.slice(0, 7) === "http://") {
        url = url.slice(7);
    }

    if (url.slice(0, 4) === "www.") {
        url = url.slice(4);
    }

    if (url.slice(url.length - 1) === "/") {
        url = url.slice(0, url.length - 1);
    }

    return url;
}

// Context Menu
browser.contextMenus.create({
    id: "block-current",
    title: "Block Current Webpage",
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "block-current") {
        let url = clearUrl(tab.url);
        if (JSON.parse(localStorage.getItem("advancedRegex"))) {
            url = "^" + url + "$";
        }
        console.log("Blocking from context menu:", url);
        addSiteBlacklist(url);
    }
});
