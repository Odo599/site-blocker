interface SitePausedStatus {
    href: string;
    ends?: Date;
    paused?: boolean;
}

interface SitePausedStatusNonParsed {
    href: string;
    ends?: number;
}

function getSites() {
    const sitesPaused = JSON.parse(localStorage.getItem("sitesPaused") || "[]");
    let sitesPausedParsed: SitePausedStatusNonParsed[];

    if (!Array.isArray(sitesPaused)) {
        console.warn(
            "[getSiteStatus]: Malfomed sitesPaused value",
            sitesPaused
        );
        localStorage.removeItem("sitesPaused");
        sitesPausedParsed = [];
    } else {
        sitesPausedParsed = sitesPaused;
    }

    let sitesPausedDoubleParsed: SitePausedStatus[] = [];

    sitesPausedParsed.forEach((site) => {
        let newSite: SitePausedStatus = { href: site.href };
        if (site.ends) {
            newSite.ends = new Date(site.ends);
        }
        sitesPausedDoubleParsed.push(newSite);
    });

    return sitesPausedDoubleParsed;
}

function unParse(site: SitePausedStatus) {
    let newSite: SitePausedStatusNonParsed = { href: site.href };
    if (site.ends) {
        newSite.ends = site.ends.getTime();
    }
    return newSite;
}

function writeSites(sites: SitePausedStatus[]) {
    let unparsedSites: SitePausedStatusNonParsed[] = [];

    sites.forEach((site) => {
        unparsedSites.push(unParse(site));
    });

    localStorage.setItem("sitesPaused", JSON.stringify(sites));
}

function getSiteStatus(siteHref: string) {
    const sitesPaused = getSites();
    const matchedSite = sitesPaused.find((site: SitePausedStatus) => {
        return site.href === siteHref;
    });

    if (matchedSite) {
        const endsMs = matchedSite.ends?.getTime();
        if (endsMs) {
            if (endsMs < Date.now()) {
                matchedSite.paused = false;
            } else {
                matchedSite.paused = true;
            }
        }
    }

    return matchedSite;
}

function addSite(siteObject: SitePausedStatus) {
    const sitesPaused = getSites();

    if (
        sitesPaused.some((site) => {
            return site.href === siteObject.href;
        })
    ) {
        return false;
    }

    sitesPaused.push(siteObject);
    writeSites(sitesPaused);
    return true;
}

function removeSite(site: string) {
    let sites = getSites();

    sites = sites.filter((s) => {
        return s.href !== site;
    });

    writeSites(sites);
}

export { getSiteStatus, addSite, SitePausedStatus, removeSite };
