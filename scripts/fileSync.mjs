function exportSettings() {
    const settings = {
        sites: JSON.parse(localStorage.getItem("blockedSites")),
        advancedRegex: JSON.parse(localStorage.getItem("advancedRegex")),
        customPageLink: localStorage.getItem("customPageLink"),
        customRedirectEnabled: JSON.parse(
            localStorage.getItem("customRedirectEnabled")
        ),
        darkmode: JSON.parse(localStorage.getItem("darkmode")),
        disabled: JSON.parse(localStorage.getItem("disabled")),
    };

    return settings;
}

function importSettings(settings) {
    localStorage.setItem("blockedSites", JSON.stringify(settings.sites));
    localStorage.setItem(
        "advancedRegex",
        JSON.stringify(settings.advancedRegex)
    );
    localStorage.setItem("customPageLink", settings.customPageLink);
    localStorage.setItem(
        "customRedirectEnabled",
        settings.customRedirectEnabled
    );
    localStorage.setItem("darkmode", settings.darkmode);
    localStorage.setItem("disabled", settings.disabled);
}

function exportStats() {
    const stats = JSON.parse(localStorage.getItem("stats"));
    return stats;
}

function importStats(stats) {
    localStorage.setItem("stats", stats);
}

function downloadFile(filename, data) {
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
            const file = event.target.files[0];
            if (!file) {
                document.body.removeChild(input);
                reject(new Error("No file selected"));
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
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
