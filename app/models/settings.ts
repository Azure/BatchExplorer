export enum Theme {
    classic = "classic",
}

/**
 * Interface mapping how the settings should be
 */
export interface Settings {
    fileTypes: StringMap<string[]>;
}
