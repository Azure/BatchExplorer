export enum Theme {
    classic = "classic",
}

export interface Settings {
    theme: string;
    fileTypes: StringMap<string[]>;
}
