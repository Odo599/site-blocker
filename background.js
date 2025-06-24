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

        if (href.slice(0, 8) === "https://") {
            href = href.slice(8);
        }

        if (href.slice(0, 7) === "http://") {
            href = href.slice(7);
        }

        if (href.slice(0, 4) === "www.") {
            href = href.slice(4);
        }

        if (href.slice(href.length - 1) === "/") {
            href = href.slice(0, href.length - 1);
        }

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
            return {
                redirectUrl: browser.runtime.getURL("redirect.html"),
            };
        }
    },
    { urls: ["<all_urls>"], types: ["main_frame"] },
    ["blocking"]
);
