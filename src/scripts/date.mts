function getDateInMinutes(minutes: number) {
    return new Date(Date.now() + minutes * 60000);
}

export { getDateInMinutes };
