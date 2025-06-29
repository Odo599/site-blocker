import {
    convertStatsToDictWithAmounts,
    getStats,
    resetStats,
} from "../../scripts/convertStats.mjs";

import {
    downloadFile,
    readFile,
    exportStats,
    importStats,
} from "../../scripts/fileSync.mjs";

console.log(convertStatsToDictWithAmounts);
console.log(getStats);

document.addEventListener("DOMContentLoaded", () => {
    const statsUl = document.querySelector("#stats");
    const resetButton = document.querySelector("#reset-button");

    const exportButton = document.querySelector("#export-stats");
    const importButton = document.querySelector("#import-stats");

    function updateStats() {
        let stats = convertStatsToDictWithAmounts(getStats());

        statsUl.innerHTML = "";

        let i = 0;
        const sortedStats = Array.from(stats.entries()).sort((a, b) => b[1] - a[1]);

        sortedStats.forEach(([key, value]) => {
            console.log(i, value, key);
            i++;
            let li = document.createElement("li");
            let nameSpan = document.createElement("span");
            let countSpan = document.createElement("span");

            nameSpan.textContent = key;
            countSpan.textContent = value;

            nameSpan.classList.add("stats-label");
            countSpan.classList.add("stats-value");

            li.appendChild(nameSpan);
            li.appendChild(countSpan);
            statsUl.appendChild(li);
        });
    }

    updateStats();

    resetButton.addEventListener("click", () => {
        resetStats();
        updateStats();
    });

    exportButton.addEventListener("click", () => {
        downloadFile("blockerStats.json", JSON.stringify(exportStats()));
    });

    importButton.addEventListener("click", () => {
        const file = readFile();
        file.then((value) => {
            console.log(value);
            importStats(JSON.stringify(value));
            updateStats();
        });
    });

    window.addEventListener("storage", (e) => {
        if (e.key === "stats") updateStats();
    });
});
