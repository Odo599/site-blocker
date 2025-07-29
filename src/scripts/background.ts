// Use dynamic import for module compatibility in background scripts
let getStats: Function;

let readBlockedSites: Function,
    writeBlockedSites: Function,
    readWhitelistedSites: Function,
    writeWhitelistedSites: Function;

(async () => {
    const statsMod = await import("./convertStats.mjs");
    getStats = statsMod.getStats;

    const storageMod = await import("./storageApi.mjs");
    readBlockedSites = storageMod.readBlockedSites;
    writeBlockedSites = storageMod.writeBlockedSites;
    readWhitelistedSites = storageMod.readWhitelistedSites;
    writeWhitelistedSites = storageMod.writeWhitelistedSites;
})();

// Website Blocking Logic
// @ts-ignore
browser.webRequest.onBeforeRequest.addListener(
    function (details: object) {
        // @ts-ignore
        const url = new URL(details.url);
        var blockedSites = readBlockedSites();
        const whitelistSites = readWhitelistedSites();

        const advancedRegex = localStorage.getItem("advancedRegex") === "true";

        let href = url.href;

        function testRegex(domain: string, url: string) {
            let regex;
            if (!advancedRegex) {
                regex = convertToRegex(domain);
            } else {
                regex = RegExp(domain, "i");
            }
            console.log(regex, url);
            return regex.test(url);
        }

        function convertToRegex(domain: string) {
            const escaped = domain.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&");
            const wildcarded = escaped.replace(/\*/g, ".*");
            const anchored = "^" + wildcarded + "$";
            return new RegExp(anchored, "i");
        }

        function logBlock(domain: string) {
            let stats = getStats();
            stats.push([domain, new Date()]);
            localStorage.setItem("stats", JSON.stringify(stats));
        }

        href = clearUrl(href);

        const matchesBlocked = blockedSites.some((domain: string) =>
            testRegex(domain, href)
        );
        const matchesWhitelisted = whitelistSites.some((domain: string) =>
            testRegex(domain, href)
        );

        console.log(matchesBlocked, matchesWhitelisted);

        if (
            // Check if still enabled
            localStorage.getItem("disabled") != "true" &&
            // Check if timeout is active
            new Date(
                JSON.parse(
                    localStorage.getItem("timeoutEnd") ||
                        JSON.stringify(new Date(0))
                )
            ) < new Date(Date.now()) &&
            // Check if site is blocked
            matchesBlocked &&
            // Check if site is not whitelisted
            !matchesWhitelisted
        ) {
            const customRedirect = JSON.parse(
                localStorage.getItem("customRedirectEnabled") || "false"
            );
            let redirectHref;
            if (customRedirect) {
                redirectHref =
                    "https://" + localStorage.getItem("customPageLink");
            } else {
                // @ts-ignore
                redirectHref = browser.runtime.getURL(
                    "src/pages/redirect/redirect.html"
                );
            }
            console.log(logBlock);
            logBlock(href);
            return {
                redirectUrl: redirectHref,
            };
        }
    },
    { urls: ["<all_urls>"], types: ["main_frame"] },
    ["blocking"]
);

function addSiteBlacklist(site: string) {
    let sites = readBlockedSites();
    if (!sites.includes(site)) {
        sites.push(site);
        writeBlockedSites(sites);
    }
}

// Remove https://*, http://*, www.* & */ from url
function clearUrl(url: string) {
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
// @ts-ignore
browser.contextMenus.create({
    id: "block-current",
    title: "Block Current Webpage",
});

// @ts-ignore
browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "block-current") {
        let url = clearUrl(tab.url);
        if (JSON.parse(localStorage.getItem("advancedRegex") || "false")) {
            url = "^" + url + "$";
        }
        console.log("Blocking from context menu:", url);
        addSiteBlacklist(url);
    }
});
