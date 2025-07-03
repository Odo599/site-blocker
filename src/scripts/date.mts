function getDateInMinutes(minutes: number) {
    return new Date(Date.now() + minutes * 60000);
}

function getMinutesUntilDate(date: Date) {
    return (date.getTime() - Date.now()) / 60000;
}

export { getDateInMinutes, getMinutesUntilDate };
