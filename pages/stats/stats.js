import {
    convertStatsToDictWithAmounts,
    getStats,
    resetStats,
} from "../../scripts/convertStats.mjs";

document.addEventListener("DOMContentLoaded", () => {
    const statsUl = document.querySelector("#stats");
    const resetButton = document.querySelector("#reset-button");

    function updateStats() {
        let stats = convertStatsToDictWithAmounts(getStats());

        statsUl.innerHTML = "";

        stats.forEach((value, key) => {
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

    window.addEventListener("storage", (e) => {
        if (e.key === "stats") updateStats();
    });
});
