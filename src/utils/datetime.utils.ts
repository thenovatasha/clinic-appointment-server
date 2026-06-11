export const convertToISOString = (date: string | Date) => {
    return new Date(date).toISOString();
};
