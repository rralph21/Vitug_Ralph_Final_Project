export const getAllAptsAsync = (): string[] => {
    // Logic to process all items from the database
    return ["Item 1", "Item 2"];
};

export const createAptAsync = (item: string): string => {
    // Logic to add a new item to the database
    return "Item added";
};

export const updateAptAsync = (id: number, item: string): string => {
    // Logic to update an item in the database
    return "Item updated";
};

export const deleteAptAsync = (id: number): string => {
    // Logic to delete an item from the database
    return "Item deleted";
};