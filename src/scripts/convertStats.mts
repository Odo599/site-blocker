function getStats() {
    let stats = JSON.parse(localStorage.getItem("stats") || "[]");
    if (stats === null) {
        stats = [];
    }
    return stats;
}

function convertStatsToList(stats: string) {
    const list = [];
    for (let i = 0; i < stats.length; i++) {
        list.push(stats[i][0]);
    }
    return list;
}

function convertStatsToDictWithAmounts(stats: Array<[string, Date]>) {
    let list = stats.map((sublist) => sublist[0]);
    let keyDict = new Map();

    for (let i = 0; i < list.length; i++) {
        if (keyDict.get(list[i]) === undefined) {
            keyDict.set(list[i], 1);
        } else {
            keyDict.set(list[i], keyDict.get(list[i]) + 1);
        }
    }

    return keyDict;
}

function resetStats() {
    localStorage.removeItem("stats");
}

export {
    getStats,
    convertStatsToList,
    convertStatsToDictWithAmounts,
    resetStats,
};
