
export interface Settings {
    homePage: "account" | "home" | "job";
}

// TODO move to a json file
export const defaultSettings: Settings = {
    homePage: "account",
};
