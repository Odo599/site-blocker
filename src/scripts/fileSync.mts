function exportSettings() {
    const settings = {
        sites: JSON.parse(localStorage.getItem("blockedSites") || "[]"),
        advancedRegex: JSON.parse(
            localStorage.getItem("advancedRegex") || "false"
        ),
        customPageLink: localStorage.getItem("customPageLink"),
        customRedirectEnabled: JSON.parse(
            localStorage.getItem("customRedirectEnabled") || "false"
        ),
        darkmode: JSON.parse(localStorage.getItem("darkmode") || "false"),
        disabled: JSON.parse(localStorage.getItem("disabled") || "false"),
    };

    return settings;
}

function importSettings(settings: {
    sites: Array<string>;
    advancedRegex: boolean;
    customPageLink: string;
    customRedirectEnabled: boolean;
    darkmode: boolean;
    disabled: boolean;
}) {
    localStorage.setItem("blockedSites", JSON.stringify(settings.sites));
    localStorage.setItem(
        "advancedRegex",
        JSON.stringify(settings.advancedRegex)
    );
    localStorage.setItem("customPageLink", settings.customPageLink);
    localStorage.setItem(
        "customRedirectEnabled",
        JSON.stringify(settings.customRedirectEnabled)
    );
    localStorage.setItem("darkmode", JSON.stringify(settings.darkmode));
    localStorage.setItem("disabled", JSON.stringify(settings.disabled));
}

function exportStats() {
    const stats = JSON.parse(localStorage.getItem("stats") || "[]");
    return stats;
}

function importStats(stats: string) {
    localStorage.setItem("stats", stats);
}

function downloadFile(filename: string, data: string) {
    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function readFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";
        input.style.display = "none";
        document.body.appendChild(input);
        input.addEventListener("change", (event) => {
            const target = event.target as HTMLInputElement | null;
            const file = target && target.files ? target.files[0] : null;
            if (!file) {
                document.body.removeChild(input);
                reject(new Error("No file selected"));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    if (!e.target || typeof e.target.result !== "string") {
                        throw new Error(
                            "File read error or result is not a string"
                        );
                    }
                    const json = JSON.parse(e.target.result);
                    resolve(json);
                } catch (err) {
                    reject(err);
                }
                document.body.removeChild(input);
            };
            reader.onerror = (e) => {
                document.body.removeChild(input);
                reject(e);
            };
            reader.readAsText(file);
        });
        input.click();
    });
}

export {
    exportSettings,
    importSettings,
    downloadFile,
    readFile,
    exportStats,
    importStats,
};
